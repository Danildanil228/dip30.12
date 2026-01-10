// back/backup.js
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const Logger = require('./logger');

const router = express.Router();
const JWT_SECRET = 'key';

// Создаем пул подключений к БД
const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

// Папка для бэкапов
const BACKUP_DIR = path.join(__dirname, 'backups');

// Создаем папку если её нет
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Middleware проверки авторизации
const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};

// Middleware проверки админа
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
};

// Найти путь к pg_dump
const findPgDumpPath = () => {
    // Проверяем стандартные пути для Windows
    const possiblePaths = [
        'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\12\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\11\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\10\\bin\\pg_dump.exe',
        'pg_dump' // Попробовать из PATH
    ];
    
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            console.log(`Найден pg_dump: ${possiblePath}`);
            return `"${possiblePath}"`;
        }
    }
    
    console.log('pg_dump не найден, пробуем из PATH');
    return 'pg_dump';
};

// 1. Создать полный бэкап
router.post('/create', checkAuth, checkAdmin, async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);
        
        // Получаем путь к pg_dump
        const pgDumpPath = findPgDumpPath();
        
        // Команда для создания полного бэкапа PostgreSQL
        // -Fc: custom формат (сжатый, быстрый для восстановления)
        // -v: verbose (подробный вывод)
        const command = `set PGPASSWORD=1234 && ${pgDumpPath} -U postgres -h localhost -p 5432 -d materialHousedb -Fc -v -f "${filepath}"`;
        
        console.log('Выполняем команду бэкапа:', command);
        
        exec(command, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
            if (error) {
                console.error('Ошибка выполнения pg_dump:', error.message);
                console.error('Stderr:', stderr);
                
                // Попробовать простую команду без формата
                console.log('Пробуем простую команду...');
                const simpleCommand = `set PGPASSWORD=1234 && ${pgDumpPath} -U postgres -h localhost -p 5432 materialHousedb > "${filepath}"`;
                
                exec(simpleCommand, { maxBuffer: 1024 * 1024 * 10 }, async (simpleError, simpleStdout, simpleStderr) => {
                    if (simpleError) {
                        console.error('Простая команда тоже не сработала:', simpleError.message);
                        
                        // Если pg_dump не работает, создаем бэкап через SQL запросы
                        await createBackupViaSQL(filepath, req.user.id, req.body.comment || 'Ручное создание');
                        
                        const stats = fs.statSync(filepath);
                        const filesize = stats.size;
                        
                        const result = await pool.query(
                            `INSERT INTO database_backups (filename, filepath, filesize, created_by, comment) 
                             VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, filesize, created_at`,
                            [filename, filepath, filesize, req.user.id, 
                             req.body.comment || 'Бэкап через SQL (pg_dump недоступен)']
                        );
                        
                        await Logger.backupCreated(req.user.id, req.user.username, filename, formatSize(filesize));
                        
                        return res.json({
                            message: 'Бэкап создан через SQL (pg_dump недоступен)',
                            backup: result.rows[0],
                            warning: 'pg_dump не найден, использован SQL бэкап'
                        });
                    }
                    
                    // Успешно создали простым способом
                    const stats = fs.statSync(filepath);
                    const filesize = stats.size;
                    
                    const result = await pool.query(
                        `INSERT INTO database_backups (filename, filepath, filesize, created_by, comment) 
                         VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, filesize, created_at`,
                        [filename, filepath, filesize, req.user.id, req.body.comment || 'Ручное создание']
                    );
                    
                    await Logger.backupCreated(req.user.id, req.user.username, filename, formatSize(filesize));
                    
                    res.json({
                        message: 'Бэкап успешно создан',
                        backup: result.rows[0]
                    });
                });
                return;
            }
            
            // Успешно создали бэкап в формате custom
            const stats = fs.statSync(filepath);
            const filesize = stats.size;
            
            const result = await pool.query(
                `INSERT INTO database_backups (filename, filepath, filesize, created_by, comment) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, filesize, created_at`,
                [filename, filepath, filesize, req.user.id, req.body.comment || 'Ручное создание']
            );
            
            await Logger.backupCreated(req.user.id, req.user.username, filename, formatSize(filesize));
            
            res.json({
                message: 'Бэкап успешно создан (custom формат)',
                backup: result.rows[0]
            });
        });
        
    } catch (error) {
        console.error('Ошибка создания бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера при создании бэкапа' });
    }
});

// Функция создания бэкапа через SQL запросы
async function createBackupViaSQL(filepath, userId, comment) {
    try {
        let backupContent = `-- Резервная копия базы данных materialHousedb\n`;
        backupContent += `-- Создано: ${new Date().toISOString()}\n`;
        backupContent += `-- Комментарий: ${comment}\n`;
        backupContent += `-- Формат: SQL (pg_dump недоступен)\n\n`;
        
        backupContent += `BEGIN;\n\n`;
        
        // Получаем все таблицы
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        // Для каждой таблицы получаем данные
        for (const table of tablesResult.rows) {
            const tableName = table.table_name;
            
            // Получаем структуру таблицы
            const columnsResult = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
            `, [tableName]);
            
            backupContent += `-- Таблица: ${tableName}\n`;
            
            // Получаем все данные из таблицы
            const dataResult = await pool.query(`SELECT * FROM ${tableName}`);
            
            if (dataResult.rows.length > 0) {
                // Создаем INSERT для каждой строки
                for (const row of dataResult.rows) {
                    const columns = [];
                    const values = [];
                    
                    for (const col of columnsResult.rows) {
                        columns.push(col.column_name);
                        
                        let value = row[col.column_name];
                        if (value === null) {
                            values.push('NULL');
                        } else if (typeof value === 'string') {
                            // Экранируем кавычки
                            value = value.replace(/'/g, "''");
                            values.push(`'${value}'`);
                        } else if (value instanceof Date) {
                            values.push(`'${value.toISOString()}'`);
                        } else {
                            values.push(value);
                        }
                    }
                    
                    backupContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
                }
            }
            
            backupContent += `\n`;
        }
        
        backupContent += `COMMIT;\n`;
        
        fs.writeFileSync(filepath, backupContent);
        console.log(`Создан SQL бэкап: ${filepath}`);
        
    } catch (error) {
        console.error('Ошибка создания SQL бэкапа:', error);
        throw error;
    }
}

// Функция форматирования размера
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 2. Получить список бэкапов (остаётся без изменений)
router.get('/list', checkAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.username as created_by_username, 
                   u2.username as restored_by_username
            FROM database_backups b
            LEFT JOIN users u ON b.created_by = u.id
            LEFT JOIN users u2 ON b.restored_by = u2.id
            ORDER BY b.created_at DESC
        `);
        
        res.json({ backups: result.rows });
    } catch (error) {
        console.error('Ошибка получения списка бэкапов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 3. Восстановить из бэкапа
router.post('/restore/:id', checkAuth, checkAdmin, async (req, res) => {
    try {
        const backupId = parseInt(req.params.id);
        
        // Получаем информацию о бэкапе
        const result = await pool.query(
            'SELECT filename, filepath FROM database_backups WHERE id = $1',
            [backupId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бэкап не найден' });
        }
        
        const backup = result.rows[0];
        
        // Проверяем существует ли файл
        if (!fs.existsSync(backup.filepath)) {
            return res.status(404).json({ error: 'Файл бэкапа не найден' });
        }
        
        // Определяем формат файла по расширению или содержимому
        const isCustomFormat = backup.filename.endsWith('.sql') ? 
            fs.readFileSync(backup.filepath, 'utf8').includes('-- Формат: SQL') : false;
        
        let command;
        if (isCustomFormat) {
            // SQL формат - используем psql
            command = `set PGPASSWORD=1234 && psql -U postgres -h localhost -p 5432 -d materialHousedb -f "${backup.filepath}"`;
        } else {
            // Custom формат - используем pg_restore
            const pgRestorePath = findPgDumpPath().replace('pg_dump', 'pg_restore');
            command = `set PGPASSWORD=1234 && ${pgRestorePath} -U postgres -h localhost -p 5432 -d materialHousedb -c "${backup.filepath}"`;
        }
        
        console.log('Выполняем команду восстановления:', command);
        
        exec(command, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
            if (error) {
                console.error('Ошибка восстановления бэкапа:', error.message);
                console.error('Stderr:', stderr);
                
                // Для SQL файлов пробуем просто через psql
                if (backup.filename.endsWith('.sql')) {
                    const simpleCommand = `set PGPASSWORD=1234 && psql -U postgres -h localhost -p 5432 materialHousedb < "${backup.filepath}"`;
                    
                    exec(simpleCommand, { maxBuffer: 1024 * 1024 * 10 }, async (simpleError) => {
                        if (simpleError) {
                            console.error('Простое восстановление тоже не сработало:', simpleError.message);
                            return res.status(500).json({ error: 'Ошибка восстановления бэкапа' });
                        }
                        
                        // Успешно восстановили
                        await pool.query(
                            'UPDATE database_backups SET restored_at = CURRENT_TIMESTAMP, restored_by = $1 WHERE id = $2',
                            [req.user.id, backupId]
                        );
                        
                        await Logger.backupRestored(req.user.id, req.user.username, backup.filename);
                        
                        res.json({
                            message: 'База данных успешно восстановлена из SQL бэкапа',
                            backup: backup.filename
                        });
                    });
                    return;
                }
                
                return res.status(500).json({ error: 'Ошибка восстановления бэкапа' });
            }
            
            // Успешно восстановили
            await pool.query(
                'UPDATE database_backups SET restored_at = CURRENT_TIMESTAMP, restored_by = $1 WHERE id = $2',
                [req.user.id, backupId]
            );
            
            await Logger.backupRestored(req.user.id, req.user.username, backup.filename);
            
            res.json({
                message: 'База данных успешно восстановлена из бэкапа',
                backup: backup.filename
            });
        });
        
    } catch (error) {
        console.error('Ошибка восстановления бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера при восстановлении' });
    }
});

// 4. Скачать бэкап (без изменений)
router.get('/download/:id', checkAuth, async (req, res) => {
    try {
        const backupId = parseInt(req.params.id);
        
        const result = await pool.query(
            'SELECT filename, filepath FROM database_backups WHERE id = $1',
            [backupId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бэкап не найден' });
        }
        
        const backup = result.rows[0];
        
        if (!fs.existsSync(backup.filepath)) {
            return res.status(404).json({ error: 'Файл бэкапа не найден' });
        }
        
        await Logger.backupDownloaded(req.user.id, req.user.username, backup.filename);
        
        res.download(backup.filepath, backup.filename);
        
    } catch (error) {
        console.error('Ошибка скачивания бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 5. Удалить бэкап (без изменений)
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
    try {
        const backupId = parseInt(req.params.id);
        
        const result = await pool.query(
            'SELECT filename, filepath FROM database_backups WHERE id = $1',
            [backupId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бэкап не найден' });
        }
        
        const backup = result.rows[0];
        
        if (fs.existsSync(backup.filepath)) {
            fs.unlinkSync(backup.filepath);
        }
        
        await pool.query('DELETE FROM database_backups WHERE id = $1', [backupId]);
        
        await Logger.backupDeleted(req.user.id, req.user.username, backup.filename);
        
        res.json({
            message: 'Бэкап успешно удален',
            deletedBackup: backup.filename
        });
        
    } catch (error) {
        console.error('Ошибка удаления бэкапа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 6. Получить статистику (без изменений)
router.get('/stats', checkAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_backups,
                COALESCE(SUM(filesize), 0) as total_size,
                COUNT(CASE WHEN restored_at IS NOT NULL THEN 1 END) as restored_count,
                MIN(created_at) as first_backup,
                MAX(created_at) as last_backup
            FROM database_backups
        `);
        
        const stats = result.rows[0];
        stats.total_size_formatted = formatSize(parseInt(stats.total_size));
        
        res.json({ stats });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;