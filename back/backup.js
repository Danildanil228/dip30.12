const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const jwt = require('jsonwebtoken');
const Logger = require('./logger');
const router = express.Router();
const execPromise = util.promisify(exec);
const os = require('os')

// Конфигурация
const JWT_SECRET = 'key';
const BACKUP_DIR = path.join(__dirname, 'backups');
const MAX_BACKUPS = 10;

// Проверяем и создаем директорию для бэкапов
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Проверка на админа
const checkAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Требуются права администратора' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};

// Получение списка бэкапов
router.get('/', checkAdmin, async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const result = await pool.query(`
            SELECT b.*, u.username as created_by_username, u.name, u.secondname
            FROM backups b
            LEFT JOIN users u ON b.created_by = u.id
            ORDER BY b.created_at DESC
        `);

        // Проверяем существование файлов
        const backupsWithFileCheck = await Promise.all(
            result.rows.map(async (backup) => {
                const fileExists = await fs.pathExists(backup.filepath);
                return {
                    ...backup,
                    file_exists: fileExists
                };
            })
        );

        res.json({ backups: backupsWithFileCheck });
    } catch (error) {
        console.error('Ошибка при получении бэкапов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание нового бэкапа
router.post('/', checkAdmin, async (req, res) => {
    try {
        const { description } = req.body;
        const pool = req.app.get('pool');
        const isWindows = os.platform() === 'win32';

        // Генерируем имя файла
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        // Параметры для pg_dump
        const dbConfig = {
            host: 'localhost',
            port: '5432',
            database: 'materialHousedb',
            user: 'postgres',
            password: '1234'
        };

        // Определяем путь к pg_dump
        let pgDumpPath = 'pg_dump';
        
        if (isWindows) {
            // Проверяем разные возможные пути
            const possiblePaths = [
                'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
                'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
                'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe',
                'C:\\Program Files\\PostgreSQL\\12\\bin\\pg_dump.exe',
                process.env.PG_DUMP_PATH // Можно задать через переменную окружения
            ].filter(Boolean);
            
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    pgDumpPath = possiblePath;
                    console.log('Found pg_dump at:', pgDumpPath);
                    break;
                }
            }
            
            if (pgDumpPath === 'pg_dump') {
                console.log('pg_dump not found in standard locations');
            }
        }

        // Команда для создания бэкапа
        const dumpCommand = `"${pgDumpPath}" -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${filepath}"`;

        console.log('Executing command:', dumpCommand);

        try {
            // Устанавливаем переменную окружения для пароля
            process.env.PGPASSWORD = dbConfig.password;
            
            // Выполняем команду
            const { stdout, stderr } = await execPromise(dumpCommand);
            
            if (stderr) {
                console.warn('pg_dump stderr:', stderr);
            }

            // Получаем размер файла
            const stats = await fs.stat(filepath);
            const fileSize = stats.size;

            // Сохраняем информацию в БД
            const result = await pool.query(
                `INSERT INTO backups (filename, filepath, file_size, created_by, description) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, filename, file_size, created_at, description`,
                [filename, filepath, fileSize, req.user.id, description || null]
            );

            const backup = result.rows[0];

            // Логирование
            await Logger.backupCreated(req.user.id, req.user.username, filename);

            // Проверяем лимит бэкапов
            const countResult = await pool.query('SELECT COUNT(*) FROM backups');
            const backupCount = parseInt(countResult.rows[0].count);

            if (backupCount > MAX_BACKUPS) {
                // Находим самые старые бэкапы сверх лимита
                const oldBackups = await pool.query(
                    'SELECT id, filename, filepath FROM backups ORDER BY created_at ASC LIMIT $1',
                    [backupCount - MAX_BACKUPS]
                );

                for (const oldBackup of oldBackups.rows) {
                    try {
                        // Удаляем файл
                        if (await fs.pathExists(oldBackup.filepath)) {
                            await fs.unlink(oldBackup.filepath);
                        }
                        // Удаляем запись из БД
                        await pool.query('DELETE FROM backups WHERE id = $1', [oldBackup.id]);
                    } catch (deleteError) {
                        console.error('Ошибка при удалении старого бэкапа:', deleteError);
                    }
                }
            }

            res.json({
                message: 'Бэкап успешно создан',
                backup: backup
            });

        } catch (dumpError) {
            console.error('Ошибка при создании бэкапа:', dumpError);
            // Удаляем частично созданный файл, если он существует
            if (await fs.pathExists(filepath)) {
                await fs.unlink(filepath);
            }
            
            let errorMessage = 'Ошибка при создании бэкапа';
            if (isWindows) {
                errorMessage += '. Убедитесь, что pg_dump.exe доступен по пути C:\\Program Files\\PostgreSQL\\...\\bin\\pg_dump.exe';
            }
            
            res.status(500).json({ 
                error: errorMessage,
                details: dumpError.message 
            });
        }

    } catch (error) {
        console.error('Ошибка при создании бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Скачивание бэкапа
router.get('/:id/download', checkAdmin, async (req, res) => {
    try {
        const backupId = parseInt(req.params.id);
        const pool = req.app.get('pool');

        // Получаем информацию о бэкапе
        const result = await pool.query(
            'SELECT filename, filepath FROM backups WHERE id = $1',
            [backupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бэкап не найден' });
        }

        const backup = result.rows[0];

        // Проверяем существование файла
        if (!await fs.pathExists(backup.filepath)) {
            return res.status(404).json({ error: 'Файл бэкапа не найден' });
        }

        // Логирование скачивания
        await Logger.backupDownloaded(req.user.id, req.user.username, backup.filename);

        // Отправляем файл для скачивания
        res.download(backup.filepath, backup.filename, (err) => {
            if (err) {
                console.error('Ошибка при скачивании файла:', err);
            }
        });

    } catch (error) {
        console.error('Ошибка при скачивании бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление бэкапа
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const backupId = parseInt(req.params.id);
        const pool = req.app.get('pool');

        // Получаем информацию о бэкапе
        const result = await pool.query(
            'SELECT filename, filepath FROM backups WHERE id = $1',
            [backupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бэкап не найден' });
        }

        const backup = result.rows[0];

        // Удаляем файл
        try {
            if (await fs.pathExists(backup.filepath)) {
                await fs.unlink(backup.filepath);
            }
        } catch (fileError) {
            console.error('Ошибка при удалении файла:', fileError);
        }

        // Удаляем запись из БД
        await pool.query('DELETE FROM backups WHERE id = $1', [backupId]);

        // Логирование
        await Logger.backupDeleted(req.user.id, req.user.username, backup.filename);

        res.json({
            message: 'Бэкап удален',
            deletedBackup: { id: backupId, filename: backup.filename }
        });

    } catch (error) {
        console.error('Ошибка при удалении бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;