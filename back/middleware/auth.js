const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { ACCESS_TOKEN_SECRET } = require("../utils/tokens");

// Базовая аутентификация - проверяет только токен
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Требуется авторизация" });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.userFromToken = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(403).json({ error: "Недействительный токен" });
    }
};

// Проверяет актуальность пользователя в БД и обновляет req.user
const checkUserInDB = async (req, res, next) => {
    try {
        if (!req.userFromToken) {
            return res.status(401).json({ error: "Не авторизован" });
        }

        const result = await pool.query("SELECT id, username, role, name, secondname, email, phone, birthday FROM users WHERE id = $1", [req.userFromToken.id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Пользователь не найден в системе" });
        }

        const dbUser = result.rows[0];

        // Проверяем, не изменилась ли роль
        if (dbUser.role !== req.userFromToken.role) {
            console.log(`Роль пользователя ${dbUser.username} изменилась с ${req.userFromToken.role} на ${dbUser.role}`);
        }

        req.user = dbUser;
        next();
    } catch (error) {
        console.error("Ошибка проверки пользователя в БД:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

// Комбинированная проверка: токен + актуальные данные из БД
const authenticateAndCheckDB = [authenticate, checkUserInDB];

// Проверка на админа с актуальной ролью из БД
const checkAdmin = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ error: "Требуются права администратора" });
    }
};

// Проверка на админа или бухгалтера
const checkAdminOrAccountant = async (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "accountant")) {
        next();
    } else {
        return res.status(403).json({ error: "Недостаточно прав" });
    }
};

module.exports = {
    authenticate,
    checkUserInDB,
    authenticateAndCheckDB,
    checkAdmin,
    checkAdminOrAccountant
};
