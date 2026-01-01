const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const app = express();
const PORT = 3000;
const JWT_SECRET = 'key'
const Logger = require('./logger')

// Создаем пул подключений к БД
const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes(':5173')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

app.get('/countUsers', async (req, res) => {
    try {
        const result = await pool.query('select count(*) from users');
        const count = parseInt(result.rows[0].count);
        res.json({ hasUsers: count > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' })
    }
});

app.post('/registerFirst', async (req, res) => {
    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countResult.rows[0].count);

        if (userCount > 0) {
            return res.status(400).json({ error: 'Регистрация первого пользователя уже выполнена' });
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем первого пользователя (админ по умолчанию)
        const result = await pool.query(
            'INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, role, name, secondname, email, phone, birthday',
            [username, hashedPassword, 'admin', 'admin', 'admin', '', '', null]
        );

        const user = result.rows[0];

        // Создаем токен
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                secondname: user.secondname
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Первый пользователь создан',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                secondname: user.secondname
            },
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        // Получаем пользователя из базы
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверные данные' });
        }

        const user = result.rows[0];

        // Проверяем пароль
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверные данные' });
        }

        // Создаем токен
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                secondname: user.secondname
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        await Logger.login(user.id, user.username);

        res.json({
            message: 'Совершен вход',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                secondname: user.secondname
            },
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/verifyToken', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) { return res.status(401).json({ valid: false }) }
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false })
    }
})



app.post('/createUser', checkAdmin, async (req, res) => {
    try {
        const { username, password, name, secondname, role } = req.body;

        // Проверка данных
        if (!username || !password || !name || !secondname || !role) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
        }

        // Получаем данные администратора из токена
        const token = req.headers.authorization?.split(' ')[1];
        let adminUsername = 'system';

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                adminUsername = decoded.username;
            } catch (error) {
                console.log('Токен не валиден, создание от имени системы');
            }
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const result = await pool.query(
            `INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING id, username, role, name, secondname, email, phone, birthday`,
            [username, hashedPassword, role, name, secondname, '', '', null]
        );

        const user = result.rows[0];

        // Логирование создания пользователя
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                await pool.query(
                    `INSERT INTO notifications (user_id, type, title, message) 
     VALUES ($1, $2, $3, $4)`,
                    [decoded.id, 'user_created', 'Создание пользователя',
                    `${decoded.username} [admin:${decoded.id}] создал пользователя [user:${result.rows[0].id}:${username}]`]
                );
            } catch (error) {
                console.log('Не удалось записать лог');
            }
        }

        res.json({
            message: 'Пользователь успешно создан',
            user: user
        });

    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);

        if (error.code === '23505') {
            return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
        }

        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.get('/users', checkAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, role, name, secondname, created_at FROM users'
        );

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление пользователя (только для админа)
app.delete('/users/:id', checkAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Получаем информацию об удаляемом пользователе
        const userToDeleteResult = await pool.query(
            'SELECT username FROM users WHERE id = $1',
            [userId]
        );

        if (userToDeleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const userToDelete = userToDeleteResult.rows[0];

        // Нельзя удалить самого себя
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Нельзя удалить самого себя' });
        }

        // Удаляем пользователя
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, username',
            [userId]
        );

        // Логирование удаления пользователя
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message) 
             VALUES ($1, $2, $3, $4)`,
            [req.user.id, 'user_deleted', 'Удаление пользователя',
            `${req.user.username} удалил пользователя ${userToDelete.username}`]
        );

        res.json({
            message: 'Пользователь удален',
            deletedUser: result.rows[0]
        });

    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


//ЛОГИ

// Получение логов 
app.get('/logs', checkAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT n.*, u.username as user_name, u.name, u.secondname 
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            ORDER BY n.created_at DESC
            LIMIT 100
        `);

        await pool.query(
            'UPDATE notifications SET read = true WHERE read = false'
        );

        res.json({ logs: result.rows });

    } catch (error) {
        console.error('Ошибка при получении логов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление лога 
app.delete('/logs/:id', checkAdmin, async (req, res) => {
    try {
        const logId = parseInt(req.params.id);

        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 RETURNING id',
            [logId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Лог не найден' });
        }

        res.json({ message: 'Лог удален' });

    } catch (error) {
        console.error('Ошибка при удалении лога:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление всех логов 
app.delete('/logs', checkAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM notifications');

        res.json({ message: 'Все логи удалены' });

    } catch (error) {
        console.error('Ошибка при удалении логов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});




// profile 

// Получение данных пользователя по ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT id, username, role, name, secondname, email, phone, 
                    birthday, created_at, updated_at 
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление данных пользователя
app.put('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, name, secondname, email, phone, birthday, role } = req.body;

        // Проверка токена
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdmin = decoded.role === 'admin';
        const isSelf = decoded.id === userId;

        // Получаем старые данные пользователя
        const oldUserResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (oldUserResult.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const oldUser = oldUserResult.rows[0];

        // Проверка прав
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        // Для не-админа нельзя менять роль и логин
        const updateData = {
            name: name || oldUser.name,
            secondname: secondname || oldUser.secondname,
            email: email || oldUser.email,
            phone: phone || oldUser.phone,
            birthday: birthday || oldUser.birthday,
            updated_at: new Date()
        };

        if (isAdmin) {
            // Username можно менять всем (и себе и другим)
            updateData.username = username || oldUser.username;

            // Роль можно менять только другим пользователям (не себе)
            if (!isSelf) {
                updateData.role = role || oldUser.role;
            } else {
                // Админ не может менять свою роль
                updateData.role = oldUser.role;
            }
        }

        // Проверка уникальности логина (если меняется)
        if (updateData.username && updateData.username !== oldUser.username) {
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [updateData.username, userId]
            );
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Логин уже занят' });
            }
        }

        // Формируем запрос
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined) {
                setClauses.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        values.push(userId);

        const query = `
            UPDATE users 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING id, username, role, name, secondname, email, phone, birthday, created_at, updated_at
        `;

        const result = await pool.query(query, values);
        const updatedUser = result.rows[0];

        // Логирование
        const changedFields = {};
        Object.entries(updateData).forEach(([key, newValue]) => {
            const oldValue = oldUser[key];
            if (newValue !== oldValue && key !== 'updated_at') {
                changedFields[key] = { old: oldValue || '', new: newValue };
            }
        });

        if (Object.keys(changedFields).length > 0) {
            if (isAdmin && !isSelf) {
                await Logger.userUpdated(
                    decoded.id,
                    decoded.username,
                    userId,
                    oldUser.username,
                    changedFields
                );
            } else {
                await Logger.profileUpdated(userId, oldUser.username, changedFields);
            }
        }

        res.json({
            message: 'Данные обновлены',
            user: updatedUser
        });

    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Недействительный токен' });
        }
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Смена пароля
app.put('/users/:id/password', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { currentPassword, newPassword, isAdminChange } = req.body;

        // Проверка токена
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdmin = decoded.role === 'admin';
        const isSelf = decoded.id === userId;

        // Проверка прав
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        // Получаем пользователя
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const user = userResult.rows[0];

        // Если это не админская смена пароля, проверяем текущий пароль
        if (!isAdminChange) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Требуется текущий пароль' });
            }

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Неверный текущий пароль' });
            }
        }

        // Проверка нового пароля
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, userId]
        );

        // Логирование
        if (isAdmin && !isSelf) {
            await Logger.adminPasswordChanged(decoded.id, decoded.username, userId, user.username);
        } else {
            await Logger.passwordChanged(userId, user.username, true);
        }

        res.json({ message: 'Пароль успешно изменен' });

    } catch (error) {
        console.error('Ошибка при смене пароля:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Недействительный токен' });
        }
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// тест
app.get('/test', (req, res) => {
    res.json({ message: 'Сервер работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});