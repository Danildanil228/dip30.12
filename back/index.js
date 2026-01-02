const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const app = express();
const PORT = 3000;
const JWT_SECRET = 'key'
const Logger = require('./logger')

const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

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


//Проверка на админа
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, role, name, secondname, email, phone, birthday',
            [username, hashedPassword, 'admin', 'admin', 'admin', '', '', null]
        );

        const user = result.rows[0];

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

        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверные данные' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверные данные' });
        }

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

        if (!username || !password || !name || !secondname || !role) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
        }

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

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING id, username, role, name, secondname, email, phone, birthday`,
            [username, hashedPassword, role, name, secondname, '', '', null]
        );

        const user = result.rows[0];

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                await Logger.userCreated(
                    decoded.id,
                    decoded.username,
                    user.username,
                    user.id  
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

        const userToDeleteResult = await pool.query(
            'SELECT username FROM users WHERE id = $1',
            [userId]
        );

        if (userToDeleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const userToDelete = userToDeleteResult.rows[0];
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Нельзя удалить самого себя' });
        }
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, username',
            [userId]
        );
        //логи
        await Logger.userDeleted(
            req.user.id,
            req.user.username,
            userToDelete.username,
            userToDelete.id
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

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdmin = decoded.role === 'admin';
        const isSelf = decoded.id === userId;

        const oldUserResult = await pool.query(
            'SELECT *, birthday::text as birthday_text FROM users WHERE id = $1',[userId]
        );

        if (oldUserResult.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const oldUser = oldUserResult.rows[0];

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        const updateData = {
            name: name || oldUser.name,
            secondname: secondname || oldUser.secondname,
            email: email || oldUser.email,
            phone: phone || oldUser.phone,
            birthday: birthday || oldUser.birthday,
            updated_at: new Date()
        };

        if (isAdmin) {
            updateData.username = username || oldUser.username;
            if (!isSelf) {
                updateData.role = role || oldUser.role;
            } else {
                updateData.role = oldUser.role;
            }
        }

        if (updateData.username && updateData.username !== oldUser.username) {
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [updateData.username, userId]
            );
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Логин уже занят' });
            }
        }

        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
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

        // логи
        const changedFields = {};
        Object.entries(updateData).forEach(([key, newValue]) => {
            let oldValue;
            if (key === 'birthday') {
                oldValue = oldUser.birthday_text || '';
            } else {
                oldValue = oldUser[key] || '';
            }

            const normalizedOldValue = String(oldValue);
            const normalizedNewValue = String(newValue || '');

            if (normalizedNewValue !== normalizedOldValue && key !== 'updated_at') {
                changedFields[key] = {
                    old: normalizedOldValue,new: normalizedNewValue
                };
            }
        });

        if (Object.keys(changedFields).length > 0) {
            if (isAdmin && !isSelf) {
                await Logger.userUpdated(
                    decoded.id,decoded.username,userId,oldUser.username,changedFields
                );
            } else {
                await Logger.profileUpdated(userId, oldUser.username, changedFields);
            }
        }

        res.json({
            message: 'Данные обновлены', user: updatedUser
        });

    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        if (error.name === 'JsonWebTokenError') {return res.status(401).json({ error: 'Недействительный токен' })}
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Смена пароля
app.put('/users/:id/password', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { currentPassword, newPassword, isAdminChange } = req.body;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {return res.status(401).json({ error: 'Требуется авторизация' })}

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdmin = decoded.role === 'admin';
        const isSelf = decoded.id === userId;

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',[userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const user = userResult.rows[0];

        if (!isAdminChange) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Требуется текущий пароль' });
            }

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Неверный текущий пароль' });
            }
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, userId]
        );

        // логи
        if (isAdmin && !isSelf) {
            await Logger.passwordChanged(
                decoded.id, decoded.username, false, userId, user.username
            );
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


                              ///// MATERIALS МАТЕРИАЛЫ \\\\\

// все категории
app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.username as created_by_username, u2.username as updated_by_username FROM material_categories c
            LEFT JOIN users u ON c.created_by = u.id LEFT JOIN users u2 ON c.updated_by = u.id ORDER BY c.name
        `);
        res.json({ categories: result.rows });
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// создать
app.post('/categories', checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Название категории обязательно' });
        }
        
        const result = await pool.query(
            `INSERT INTO material_categories (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
            [name, description || null, decoded.id]
        );
        
        // Логирование
        await Logger.log(
            decoded.id,
            'category_created',
            'Создание категории',
            `Администратор ${decoded.username} создал категорию: ${name}`
        );
        
        res.json({
            message: 'Категория создана',
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при создании категории:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Категория с таким названием уже существует' });
        }
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


//update
app.put('/categories/:id', checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const categoryId = parseInt(req.params.id);
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Название категории обязательно' });
        }
        
        // Получаем старые данные для логирования
        const oldCategoryResult = await pool.query(
            'SELECT * FROM material_categories WHERE id = $1',
            [categoryId]
        );
        
        if (oldCategoryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }
        
        const oldCategory = oldCategoryResult.rows[0];
        
        const result = await pool.query(
            `UPDATE material_categories SET name = $1, description = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
            [name, description || null, decoded.id, categoryId]
        );
        
        // Логирование изменений
        const changes = [];
        if (name !== oldCategory.name) changes.push(`название: "${oldCategory.name}" → "${name}"`);
        if (description !== oldCategory.description) changes.push('описание изменено');
        
        if (changes.length > 0) {
            await Logger.log(
                decoded.id,
                'category_updated',
                'Изменение категории',
                `Администратор ${decoded.username} изменил категорию "${oldCategory.name}": ${changes.join(', ')}`
            );
        }
        
        res.json({
            message: 'Категория обновлена',
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при обновлении категории:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Категория с таким названием уже существует' });
        }
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

///delete
app.delete('/categories/:id', checkAdmin, async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        
        // Проверяем, есть ли материалы в этой категории
        const materialsCheck = await pool.query(
            'SELECT COUNT(*) FROM materials WHERE category_id = $1',
            [categoryId]
        );
        
        const materialCount = parseInt(materialsCheck.rows[0].count);
        if (materialCount > 0) {
            return res.status(400).json({ 
                error: `Невозможно удалить категорию: в ней находится ${materialCount} материал(ов)`,
                materialCount: materialCount
            });
        }
        
        // Получаем информацию о категории для логирования
        const categoryResult = await pool.query(
            'SELECT name FROM material_categories WHERE id = $1',
            [categoryId]
        );
        
        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }
        
        const categoryName = categoryResult.rows[0].name;
        
        // Удаляем категорию
        const result = await pool.query(
            'DELETE FROM material_categories WHERE id = $1 RETURNING id, name',
            [categoryId]
        );
        
        // Логирование
        await Logger.log(
            req.user.id,
            'category_deleted',
            'Удаление категории',
            `Администратор ${req.user.username} удалил категорию: ${categoryName}`
        );
        
        res.json({
            message: 'Категория удалена',
            deletedCategory: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.get('/materials', async (req, res) => {
    try {
        const { category_id, search, low_stock } = req.query;
        
        let query = `
            SELECT m.*, c.name as category_name, uc.username as created_by_username, uu.username as updated_by_username
            FROM materials m
            LEFT JOIN material_categories c ON m.category_id = c.id LEFT JOIN users uc ON m.created_by = uc.id LEFT JOIN users uu ON m.updated_by = uu.id WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        if (category_id) {
            query += ` AND m.category_id = $${paramIndex}`;
            params.push(category_id);
            paramIndex++;
        }
        
        if (search) {
            query += ` AND (m.name ILIKE $${paramIndex} OR m.code ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (low_stock === 'true') {
            query += ` AND m.quantity < 10`; // Можно сделать настраиваемым
        }
        
        query += ` ORDER BY m.name`;
        
        const result = await pool.query(query, params);
        
        // Получаем статистику
        const statsResult = await pool.query(`
            SELECT COUNT(*) as total_materials, SUM(quantity) as total_quantity, COUNT(DISTINCT category_id) as categories_count FROM materials
        `);
        
        res.json({ 
            materials: result.rows,
            stats: statsResult.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при получении материалов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/materials/:id', checkAdmin, async (req, res) => {
    try {
        const materialId = parseInt(req.params.id);
        
        const result = await pool.query(`
            SELECT m.*, c.name as category_name, uc.username as created_by_username, uu.username as updated_by_username FROM materials m LEFT JOIN material_categories c ON m.category_id = c.id LEFT JOIN users uc ON m.created_by = uc.id LEFT JOIN users uu ON m updated_by = uu.id WHERE m.id = $1
        `, [materialId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Материал не найден' });
        }
        
        res.json({ material: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при получении материала:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/materials', checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        
        const { name, code, description, unit, category_id, quantity } = req.body;
        
        if (!name || !unit) {
            return res.status(400).json({ error: 'Название и единица измерения обязательны' });
        }
        
        if (!code) {
            return res.status(400).json({ error: 'Код материала обязателен' });
        }
        
        if (quantity && quantity < 0) {
            return res.status(400).json({ error: 'Количество не может быть отрицательным' });
        }
        
        // Проверяем уникальность кода
        const existingCode = await pool.query(
            'SELECT id FROM materials WHERE code = $1',
            [code]
        );
        if (existingCode.rows.length > 0) {
            return res.status(400).json({ error: 'Материал с таким кодом уже существует' });
        }
        
        // Если указана категория, проверяем её существование
        if (category_id) {
            const categoryExists = await pool.query(
                'SELECT id FROM material_categories WHERE id = $1',
                [category_id]
            );
            if (categoryExists.rows.length === 0) {
                return res.status(400).json({ error: 'Указанная категория не существует' });
            }
        }
        
        const result = await pool.query(
            `INSERT INTO materials (name, code, description, unit, category_id, quantity, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [name, code, description || null, unit, category_id || null, quantity || 0, decoded.id]
        );
        
        // Логирование
        await Logger.materialCreated(decoded.id, decoded.username, name);
        
        res.json({
            message: 'Материал создан',
            material: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при создании материала:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.put('/materials/:id', checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        
        const materialId = parseInt(req.params.id);
        const { name, code, description, unit, category_id } = req.body;
        
        if (!name || !unit) {
            return res.status(400).json({ error: 'Название и единица измерения обязательны' });
        }
        
        // Получаем старые данные для логирования
        const oldMaterialResult = await pool.query(
            'SELECT * FROM materials WHERE id = $1',
            [materialId]
        );
        
        if (oldMaterialResult.rows.length === 0) {
            return res.status(404).json({ error: 'Материал не найден' });
        }
        
        const oldMaterial = oldMaterialResult.rows[0];
        
        // Проверяем уникальность кода (если меняется)
        if (code && code !== oldMaterial.code) {
            const existingCode = await pool.query(
                'SELECT id FROM materials WHERE code = $1 AND id != $2',
                [code, materialId]
            );
            if (existingCode.rows.length > 0) {
                return res.status(400).json({ error: 'Материал с таким кодом уже существует' });
            }
        }
        
        // Если указана категория, проверяем её существование
        if (category_id) {
            const categoryExists = await pool.query(
                'SELECT id FROM material_categories WHERE id = $1',
                [category_id]
            );
            if (categoryExists.rows.length === 0) {
                return res.status(400).json({ error: 'Указанная категория не существует' });
            }
        }
        
        const result = await pool.query(
            `UPDATE materials 
             SET name = $1, code = $2, description = $3, unit = $4, 
                 category_id = $5, updated_by = $6, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 
             RETURNING *`,
            [name, code || null, description || null, unit, category_id || null, decoded.id, materialId]
        );
        
        // Логирование изменений
        const changes = [];
        if (name !== oldMaterial.name) changes.push(`название: "${oldMaterial.name}" → "${name}"`);
        if (code !== oldMaterial.code) changes.push(`код: "${oldMaterial.code}" → "${code}"`);
        if (unit !== oldMaterial.unit) changes.push(`единица: "${oldMaterial.unit}" → "${unit}"`);
        if (category_id !== oldMaterial.category_id) changes.push('категория изменена');
        
        if (changes.length > 0) {
            await Logger.materialUpdated(decoded.id, decoded.username, oldMaterial.name, changes.join(', '));
        }
        
        res.json({
            message: 'Материал обновлен',
            material: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при обновлении материала:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/materials/:id', checkAdmin, async (req, res) => {
    try {
        const materialId = parseInt(req.params.id);
        
        // Получаем информацию о материале для логирования
        const materialResult = await pool.query(
            'SELECT name, quantity FROM materials WHERE id = $1',
            [materialId]
        );
        
        if (materialResult.rows.length === 0) {
            return res.status(404).json({ error: 'Материал не найден' });
        }
        
        const material = materialResult.rows[0];
        
        // Проверяем, есть ли остаток на складе
        if (material.quantity > 0) {
            return res.status(400).json({ 
                error: `Невозможно удалить материал: на складе осталось ${material.quantity} ед.`
            });
        }
        
        // Удаляем материал
        const result = await pool.query(
            'DELETE FROM materials WHERE id = $1 RETURNING id, name, code',
            [materialId]
        );
        
        // Логирование
        await Logger.materialDeleted(req.user.id, req.user.username, material.name);
        
        res.json({
            message: 'Материал удален',
            deletedMaterial: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при удалении материала:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// тест
app.get('/test', (req, res) => {res.json({ message: 'hello world' })});

// Запуск сервера
app.listen(PORT, () => { console.log(`Сервер запущен на http://localhost:${PORT}`)});