const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const app = express();
const PORT = 3000;
const JWT_SECRET = 'key'

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

app.get('/countUsers', async (req,res) => {
    try{
        const result = await pool.query('select count(*) from users');
        const count = parseInt(result.rows[0].count);
        res.json({hasUsers: count > 0});
    } catch (error) {
        console.error(error);
        res.status(500).json({error : 'Ошибка сервера'})
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
            'INSERT INTO users (username, password, role, name, secondname) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, name, secondname',
            [username, hashedPassword, 'admin', 'admin', 'admin']
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
            { expiresIn: '12h' }
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
            { expiresIn: '12h' }
        );
        
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

app.get('verifyToken', (req, res) => {
    try{ 
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) { return res.status(401).json({valid: false})}
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({valid:true, user:decoded });
    } catch (error) {
        res.status(401).json({valid:false})
    }
})




// тест
app.get('/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});