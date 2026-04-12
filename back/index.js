const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 3000;
const JWT_SECRET = "key";
const Logger = require("./logger");
const backupRoutes = require("./backup");

const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: "localhost",
    port: "5432",
    database: "materialHousedb"
});
app.set("pool", pool);

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (origin.includes(":5173")) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());
app.use("/backups", backupRoutes);

//Проверка на админа
const checkAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Требуются права администратора" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Недействительный токен" });
    }
};

app.get("/countUsers", async (req, res) => {
    try {
        const result = await pool.query("select count(*) from users");
        const count = parseInt(result.rows[0].count);
        res.json({ hasUsers: count > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.post("/registerFirst", async (req, res) => {
    try {
        const countResult = await pool.query("SELECT COUNT(*) FROM users");
        const userCount = parseInt(countResult.rows[0].count);

        if (userCount > 0) {
            return res.status(400).json({ error: "Регистрация первого пользователя уже выполнена" });
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Заполните все поля" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, role, name, secondname, email, phone, birthday",
            [username, hashedPassword, "admin", "admin", "admin", "", "", null]
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
            { expiresIn: "8h" }
        );

        res.json({
            message: "Первый пользователь создан",
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
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Заполните все поля" });
        }

        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Неверные данные" });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Неверные данные" });
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
            { expiresIn: "8h" }
        );

        await Logger.login(user.id, user.username);

        res.json({
            message: "Совершен вход",
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
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/verifyToken", (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ valid: false });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

app.post("/createUser", checkAdmin, async (req, res) => {
    try {
        const { username, password, name, secondname, role } = req.body;

        if (!username || !password || !name || !secondname || !role) {
            return res.status(400).json({ error: "Заполните все поля" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
        }

        const token = req.headers.authorization?.split(" ")[1];
        let adminUsername = "system";

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                adminUsername = decoded.username;
            } catch (error) {
                console.log("Токен не валиден, создание от имени системы");
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING id, username, role, name, secondname, email, phone, birthday`,
            [username, hashedPassword, role, name, secondname, "", "", null]
        );

        const user = result.rows[0];

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                await Logger.userCreated(decoded.id, decoded.username, user.username, user.id);
            } catch (error) {
                console.log("Не удалось записать лог");
            }
        }

        res.json({
            message: "Пользователь успешно создан",
            user: user
        });
    } catch (error) {
        console.error("Ошибка при создании пользователя:", error);

        if (error.code === "23505") {
            return res.status(400).json({ error: "Пользователь с таким логином уже существует" });
        }

        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/users", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        let query = "SELECT id, username, role, name, secondname, created_at FROM users";
        const params = [];

        if (decoded.role === "admin") {
            query += " ORDER BY name, secondname";
        } else if (decoded.role === "accountant") {
            query += " WHERE role IN ('storekeeper', 'accountant') ORDER BY name, secondname";
        } else {
            return res.json({ users: [] });
        }

        const result = await pool.query(query, params);
        res.json({ users: result.rows });
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Удаление пользователя
app.delete("/users/:id", checkAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const userToDeleteResult = await pool.query("SELECT username FROM users WHERE id = $1", [userId]);

        if (userToDeleteResult.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const userToDelete = userToDeleteResult.rows[0];
        if (userId === req.user.id) {
            return res.status(400).json({ error: "Нельзя удалить самого себя" });
        }
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, username", [userId]);
        await Logger.userDeleted(req.user.id, req.user.username, userToDelete.username, userToDelete.id);

        res.json({
            message: "Пользователь удален",
            deletedUser: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

//ЛОГИ

// Получение логов
app.get("/logs", checkAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT n.*, u.username as user_name, u.name, u.secondname 
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            ORDER BY n.created_at DESC
        `);

        await pool.query("UPDATE notifications SET read = true WHERE read = false");

        res.json({ logs: result.rows });
    } catch (error) {
        console.error("Ошибка при получении логов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Удаление лога
app.delete("/logs/:id", checkAdmin, async (req, res) => {
    try {
        const logId = parseInt(req.params.id);

        const result = await pool.query("DELETE FROM notifications WHERE id = $1 RETURNING id", [logId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Лог не найден" });
        }

        res.json({ message: "Лог удален" });
    } catch (error) {
        console.error("Ошибка при удалении лога:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Удаление всех логов
app.delete("/logs", checkAdmin, async (req, res) => {
    try {
        await pool.query("DELETE FROM notifications");
        res.json({ message: "Все логи удалены" });
    } catch (error) {
        console.error("Ошибка при удалении логов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// profile

// Получение данных пользователя по ID
app.get("/users/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT id, username, role, name, secondname, email, phone, 
                    birthday, created_at, updated_at 
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Обновление данных пользователя
app.put("/users/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, name, secondname, email, phone, birthday, role } = req.body;

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdmin = decoded.role === "admin";
        const isSelf = decoded.id === userId;

        const oldUserResult = await pool.query("SELECT *, birthday::text as birthday_text FROM users WHERE id = $1", [userId]);

        if (oldUserResult.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const oldUser = oldUserResult.rows[0];

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: "Недостаточно прав" });
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
            const existingUser = await pool.query("SELECT id FROM users WHERE username = $1 AND id != $2", [updateData.username, userId]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: "Логин уже занят" });
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
            SET ${setClauses.join(", ")} 
            WHERE id = $${paramIndex} 
            RETURNING id, username, role, name, secondname, email, phone, birthday, created_at, updated_at
        `;

        const result = await pool.query(query, values);
        const updatedUser = result.rows[0];

        const changedFields = {};
        Object.entries(updateData).forEach(([key, newValue]) => {
            let oldValue;
            if (key === "birthday") {
                if (oldUser.birthday) {
                    const oldDate = new Date(oldUser.birthday);
                    oldValue = oldDate.toISOString().split("T")[0];
                } else {
                    oldValue = "";
                }
                if (newValue) {
                    const newDate = new Date(newValue);
                    newValue = newDate.toISOString().split("T")[0];
                }
            } else {
                oldValue = oldUser[key] || "";
            }

            const normalizedOldValue = String(oldValue);
            const normalizedNewValue = String(newValue || "");

            if (normalizedNewValue !== normalizedOldValue && key !== "updated_at") {
                changedFields[key] = {
                    old: normalizedOldValue,
                    new: normalizedNewValue
                };
            }
        });

        if (Object.keys(changedFields).length > 0) {
            if (isAdmin && !isSelf) {
                await Logger.userUpdated(decoded.id, decoded.username, userId, oldUser.username, changedFields);
            } else {
                await Logger.profileUpdated(userId, oldUser.username, changedFields);
            }
        }

        res.json({
            message: "Данные обновлены",
            user: updatedUser
        });
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Недействительный токен" });
        }
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Смена пароля
app.put("/users/:id/password", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { currentPassword, newPassword, isAdminChange } = req.body;

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdmin = decoded.role === "admin";
        const isSelf = decoded.id === userId;

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const user = userResult.rows[0];

        if (!isAdminChange) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Требуется текущий пароль" });
            }

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "Неверный текущий пароль" });
            }
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query("UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [hashedPassword, userId]);

        if (isAdmin && !isSelf) {
            await Logger.passwordChanged(decoded.id, decoded.username, false, userId, user.username);
        } else {
            await Logger.passwordChanged(userId, user.username, true);
        }

        res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
        console.error("Ошибка при смене пароля:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Недействительный токен" });
        }
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

///// MATERIALS МАТЕРИАЛЫ \\\\\

// все категории
app.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT c.*, 
                   uc.username as created_by_username, 
                   uu.username as updated_by_username
            FROM materialcategories c
            LEFT JOIN users uc ON c.created_by = uc.id
            LEFT JOIN users uu ON c.updated_by = uu.id
            ORDER BY c.name
        `);
        res.json({ categories: result.rows });
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// создать
app.post("/categories", checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Название категории обязательно" });
        }

        const result = await pool.query(`INSERT INTO materialCategories (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`, [name, description || null, decoded.id]);

        await Logger.log(decoded.id, "category_created", "Создание категории", `Администратор ${decoded.username} создал категорию: ${name}`);

        res.json({
            message: "Категория создана",
            category: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при создании категории:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "Категория с таким названием уже существует" });
        }
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

//update
app.put("/categories/:id", checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const categoryId = parseInt(req.params.id);
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Название категории обязательно" });
        }

        const oldCategoryResult = await pool.query("SELECT * FROM materialCategories WHERE id = $1", [categoryId]);

        if (oldCategoryResult.rows.length === 0) {
            return res.status(404).json({ error: "Категория не найдена" });
        }

        const oldCategory = oldCategoryResult.rows[0];

        const result = await pool.query(`UPDATE materialCategories SET name = $1, description = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`, [name, description || null, decoded.id, categoryId]);

        const changes = [];
        if (name !== oldCategory.name) changes.push(`название: "${oldCategory.name}" → "${name}"`);
        if (description !== oldCategory.description) changes.push("описание изменено");

        if (changes.length > 0) {
            await Logger.log(decoded.id, "category_updated", "Изменение категории", `Администратор ${decoded.username} изменил категорию "${oldCategory.name}": ${changes.join(", ")}`);
        }

        res.json({
            message: "Категория обновлена",
            category: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при обновлении категории:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "Категория с таким названием уже существует" });
        }
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

///delete
app.delete("/categories/:id", checkAdmin, async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);

        const materialsCheck = await pool.query("SELECT COUNT(*) FROM materials WHERE category_id = $1", [categoryId]);

        const materialCount = parseInt(materialsCheck.rows[0].count);
        if (materialCount > 0) {
            return res.status(400).json({
                error: `Невозможно удалить категорию: в ней находится ${materialCount} материал(ов)`,
                materialCount: materialCount
            });
        }

        const categoryResult = await pool.query("SELECT name FROM materialCategories WHERE id = $1", [categoryId]);

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ error: "Категория не найдена" });
        }

        const categoryName = categoryResult.rows[0].name;

        const result = await pool.query("DELETE FROM materialCategories WHERE id = $1 RETURNING id, name", [categoryId]);

        await Logger.log(req.user.id, "category_deleted", "Удаление категории", `Администратор ${req.user.username} удалил категорию: ${categoryName}`);

        res.json({
            message: "Категория удалена",
            deletedCategory: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при удалении категории:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/materials", async (req, res) => {
    try {
        const { category_id, search, low_stock } = req.query;

        let query = `
            SELECT m.*, c.name as category_name, uc.username as created_by_username, uu.username as updated_by_username
            FROM materials m
            LEFT JOIN materialCategories c ON m.category_id = c.id LEFT JOIN users uc ON m.created_by = uc.id LEFT JOIN users uu ON m.updated_by = uu.id WHERE 1=1
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

        if (low_stock === "true") {
            query += ` AND m.quantity < 10`;
        }

        query += ` ORDER BY m.name`;

        const result = await pool.query(query, params);

        const statsResult = await pool.query(`
            SELECT COUNT(*) as total_materials, SUM(quantity) as total_quantity, COUNT(DISTINCT category_id) as categories_count FROM materials
        `);

        res.json({
            materials: result.rows,
            stats: statsResult.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при получении материалов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/materials/:id", async (req, res) => {
    try {
        const materialId = parseInt(req.params.id);

        const result = await pool.query(
            `
            SELECT m.*, 
                   c.name as category_name, 
                   uc.username as created_by_username, 
                   uu.username as updated_by_username 
            FROM materials m 
            LEFT JOIN materialCategories c ON m.category_id = c.id 
            LEFT JOIN users uc ON m.created_by = uc.id 
            LEFT JOIN users uu ON m.updated_by = uu.id 
            WHERE m.id = $1
        `,
            [materialId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Материал не найден" });
        }

        res.json({ material: result.rows[0] });
    } catch (error) {
        console.error("Ошибка при получении материала:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.post("/materials", checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const { name, code, description, unit, category_id, quantity } = req.body;

        if (!name || !unit) {
            return res.status(400).json({ error: "Название и единица измерения обязательны" });
        }

        if (!code) {
            return res.status(400).json({ error: "Код материала обязателен" });
        }

        if (quantity && quantity < 0) {
            return res.status(400).json({ error: "Количество не может быть отрицательным" });
        }

        const existingCode = await pool.query("SELECT id FROM materials WHERE code = $1", [code]);
        if (existingCode.rows.length > 0) {
            return res.status(400).json({ error: "Материал с таким кодом уже существует" });
        }

        if (category_id) {
            const categoryExists = await pool.query("SELECT id FROM materialCategories WHERE id = $1", [category_id]);
            if (categoryExists.rows.length === 0) {
                return res.status(400).json({ error: "Указанная категория не существует" });
            }
        }

        const result = await pool.query(
            `INSERT INTO materials (name, code, description, unit, category_id, quantity, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [name, code, description || null, unit, category_id || null, quantity || 0, decoded.id]
        );

        await Logger.materialCreated(decoded.id, decoded.username, name);

        res.json({
            message: "Материал создан",
            material: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при создании материала:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.put("/materials/:id", checkAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const materialId = parseInt(req.params.id);
        const { name, code, description, unit, category_id } = req.body;

        if (!name || !unit) {
            return res.status(400).json({ error: "Название и единица измерения обязательны" });
        }

        const oldMaterialResult = await pool.query("SELECT * FROM materials WHERE id = $1", [materialId]);

        if (oldMaterialResult.rows.length === 0) {
            return res.status(404).json({ error: "Материал не найден" });
        }

        const oldMaterial = oldMaterialResult.rows[0];

        if (code && code !== oldMaterial.code) {
            const existingCode = await pool.query("SELECT id FROM materials WHERE code = $1 AND id != $2", [code, materialId]);
            if (existingCode.rows.length > 0) {
                return res.status(400).json({ error: "Материал с таким кодом уже существует" });
            }
        }

        if (category_id) {
            const categoryExists = await pool.query("SELECT id FROM materialCategories WHERE id = $1", [category_id]);
            if (categoryExists.rows.length === 0) {
                return res.status(400).json({ error: "Указанная категория не существует" });
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

        const changes = [];
        if (name !== oldMaterial.name) changes.push(`название: "${oldMaterial.name}" → "${name}"`);
        if (code !== oldMaterial.code) changes.push(`код: "${oldMaterial.code}" → "${code}"`);
        if (unit !== oldMaterial.unit) changes.push(`единица: "${oldMaterial.unit}" → "${unit}"`);
        if (category_id !== oldMaterial.category_id) changes.push("категория изменена");

        if (changes.length > 0) {
            await Logger.materialUpdated(decoded.id, decoded.username, oldMaterial.name, changes.join(", "));
        }

        res.json({
            message: "Материал обновлен",
            material: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при обновлении материала:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.delete("/materials/:id", checkAdmin, async (req, res) => {
    try {
        const materialId = parseInt(req.params.id);

        const materialResult = await pool.query("SELECT name, quantity FROM materials WHERE id = $1", [materialId]);

        if (materialResult.rows.length === 0) {
            return res.status(404).json({ error: "Материал не найден" });
        }

        const material = materialResult.rows[0];

        if (material.quantity > 0) {
            return res.status(400).json({
                error: `Невозможно удалить материал: на складе осталось ${material.quantity} ед.`
            });
        }

        const result = await pool.query("DELETE FROM materials WHERE id = $1 RETURNING id, name, code", [materialId]);

        await Logger.materialDeleted(req.user.id, req.user.username, material.name);

        res.json({
            message: "Материал удален",
            deletedMaterial: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка при удалении материала:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

//// ===========ЗАЯВКИ============

// Получение списка заявок
app.get("/requests", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { status } = req.query;

        let query = `
            SELECT r.*, 
                   u.username as created_by_username,
                   (SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'quantity', ri.quantity))
                    FROM material_requests_items ri
                    JOIN materials m ON ri.material_id = m.id
                    WHERE ri.request_id = r.id
                    LIMIT 3) as items_preview
            FROM material_requests r
            LEFT JOIN users u ON r.created_by = u.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (status && status !== "all") {
            query += ` AND r.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        const isAdmin = decoded.role === "admin";
        if (!isAdmin) {
            query += ` AND (r.is_public = true OR r.created_by = $${paramIndex})`;
            params.push(decoded.id);
            paramIndex++;
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ requests: result.rows });
    } catch (error) {
        console.error("Ошибка получения заявок:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Получение конкретной заявки
app.get("/requests/:id", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const requestId = parseInt(req.params.id);

        const requestResult = await pool.query(
            `SELECT r.*, 
                    u1.username as created_by_username,
                    u1.name as created_by_name,
                    u1.secondname as created_by_secondname,
                    u2.username as reviewed_by_username
             FROM material_requests r
             LEFT JOIN users u1 ON r.created_by = u1.id
             LEFT JOIN users u2 ON r.reviewed_by = u2.id
             WHERE r.id = $1`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: "Заявка не найдена" });
        }

        const request = requestResult.rows[0];

        const isAdminOrAccountant = decoded.role === "admin" || decoded.role === "accountant";
        const isCreator = decoded.id === request.created_by;
        const canView = isAdminOrAccountant || isCreator || request.is_public === true;

        if (!canView) {
            return res.status(403).json({ error: "Недостаточно прав для просмотра этой заявки" });
        }

        const itemsResult = await pool.query(
            `SELECT ri.*, m.name, m.code, m.unit
             FROM material_requests_items ri
             LEFT JOIN materials m ON ri.material_id = m.id
             WHERE ri.request_id = $1
             ORDER BY ri.id`,
            [requestId]
        );

        res.json({
            request: request,
            items: itemsResult.rows
        });
    } catch (error) {
        console.error("Ошибка получения заявки:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Создание заявки
app.post("/requests", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { title, request_type, notes, items, is_public } = req.body;

        if (!title || !request_type || !items || !items.length) {
            return res.status(400).json({ error: "Заполните обязательные поля (название, тип, хотя бы один товар)" });
        }

        if (request_type !== "incoming" && request_type !== "outgoing") {
            return res.status(400).json({ error: "Неверный тип заявки" });
        }

        for (const item of items) {
            if (!item.material_id || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ error: "Неверные данные товаров" });
            }
        }

        const materialIds = items.map((item) => item.material_id);
        const materialsResult = await pool.query("SELECT id, name, quantity FROM materials WHERE id = ANY($1)", [materialIds]);

        const materialsMap = new Map();
        materialsResult.rows.forEach((m) => materialsMap.set(m.id, m));

        for (const item of items) {
            if (!materialsMap.has(item.material_id)) {
                return res.status(404).json({ error: `Товар с ID ${item.material_id} не найден` });
            }
        }

        if (request_type === "outgoing") {
            for (const item of items) {
                const material = materialsMap.get(item.material_id);
                if (material.quantity < item.quantity) {
                    return res.status(400).json({
                        error: `Недостаточно товара "${material.name}". Остаток: ${material.quantity}, запрошено: ${item.quantity}`
                    });
                }
            }
        }

        const isAdmin = decoded.role === "admin";
        const isApproved = isAdmin && req.body.is_approved === true;
        const status = isApproved ? "approved" : "pending";
        const publicStatus = isAdmin ? is_public !== false : true;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const requestResult = await client.query(
                `INSERT INTO material_requests (title, request_type, status, created_by, notes, is_public, reviewed_by, reviewed_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [title, request_type, status, decoded.id, notes || null, publicStatus, isApproved ? decoded.id : null, isApproved ? new Date() : null]
            );

            const newRequest = requestResult.rows[0];

            Logger.setCurrentRequestId(newRequest.id);

            for (const item of items) {
                const material = materialsMap.get(item.material_id);
                await client.query(
                    `INSERT INTO material_requests_items (request_id, material_id, quantity, current_quantity_at_request)
                     VALUES ($1, $2, $3, $4)`,
                    [newRequest.id, item.material_id, item.quantity, material.quantity]
                );
            }

            if (isApproved) {
                for (const item of items) {
                    const material = materialsMap.get(item.material_id);
                    const newQuantity = request_type === "incoming" ? material.quantity + item.quantity : material.quantity - item.quantity;

                    await client.query("UPDATE materials SET quantity = $1, updated_at = NOW() WHERE id = $2", [newQuantity, item.material_id]);
                }
            }

            await client.query("COMMIT");

            const itemsList = items
                .map((i) => {
                    const material = materialsMap.get(i.material_id);
                    return `${material.name} (${i.quantity})`;
                })
                .join(", ");

            await Logger.requestCreated(decoded.id, decoded.username, title, request_type, itemsList);

            if (isApproved) {
                await Logger.requestApproved(decoded.id, decoded.username, title, request_type, itemsList);
                res.json({
                    message: "Заявка создана и подтверждена",
                    request: newRequest,
                    autoApproved: true
                });
            } else {
                res.json({
                    message: "Заявка создана",
                    request: newRequest,
                    autoApproved: false
                });
            }
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Ошибка создания заявки:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Подтверждение заявки
app.put("/requests/:id/approve", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin" && decoded.role !== "accountant") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const requestId = parseInt(req.params.id);

        const requestResult = await pool.query(
            `SELECT r.*, 
                    array_agg(json_build_object('id', ri.id, 'material_id', ri.material_id, 'quantity', ri.quantity, 'current_quantity', ri.current_quantity_at_request)) as items
             FROM material_requests r
             LEFT JOIN material_requests_items ri ON r.id = ri.request_id
             WHERE r.id = $1 AND r.status = 'pending'
             GROUP BY r.id`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: "Заявка не найдена или уже обработана" });
        }

        const request = requestResult.rows[0];
        const items = request.items || [];

        if (request.request_type === "outgoing") {
            for (const item of items) {
                const currentMaterial = await pool.query("SELECT quantity FROM materials WHERE id = $1", [item.material_id]);

                if (currentMaterial.rows[0].quantity < item.quantity) {
                    return res.status(400).json({
                        error: `Недостаточно товара. Запрошено: ${item.quantity}, остаток: ${currentMaterial.rows[0].quantity}`
                    });
                }
            }
        }

        Logger.setCurrentRequestId(requestId);

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `UPDATE material_requests 
                 SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
                 WHERE id = $2`,
                [decoded.id, requestId]
            );

            for (const item of items) {
                const newQuantity = request.request_type === "incoming" ? item.current_quantity + item.quantity : item.current_quantity - item.quantity;

                await client.query("UPDATE materials SET quantity = $1, updated_at = NOW() WHERE id = $2", [newQuantity, item.material_id]);
            }

            await client.query("COMMIT");

            const itemsList = items.map((i) => `ID:${i.material_id} (${i.quantity})`).join(", ");
            await Logger.requestApproved(decoded.id, decoded.username, request.title, request.request_type, itemsList);

            res.json({ message: "Заявка подтверждена" });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Ошибка подтверждения заявки:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Отклонение заявки
app.put("/requests/:id/reject", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin" && decoded.role !== "accountant") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const requestId = parseInt(req.params.id);
        const { rejection_reason } = req.body;

        if (!rejection_reason || rejection_reason.trim() === "") {
            return res.status(400).json({ error: "Укажите причину отклонения" });
        }

        const requestResult = await pool.query("SELECT title, request_type FROM material_requests WHERE id = $1 AND status = $2", [requestId, "pending"]);

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: "Заявка не найдена или уже обработана" });
        }

        const request = requestResult.rows[0];

        Logger.setCurrentRequestId(requestId);

        await pool.query(
            `UPDATE material_requests 
             SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
             WHERE id = $3`,
            [decoded.id, rejection_reason, requestId]
        );

        await Logger.requestRejected(decoded.id, decoded.username, request.title, request.request_type, rejection_reason);

        res.json({ message: "Заявка отклонена" });
    } catch (error) {
        console.error("Ошибка отклонения заявки:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// =========== ИНВЕНТАРИЗАЦИЯ =============

// Получение списка инвентаризаций
app.get("/inventories", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const isAdminOrAccountant = decoded.role === "admin" || decoded.role === "accountant";

        let query = `
            SELECT i.*, 
                   u1.username as created_by_username,
                   u2.username as responsible_username,
                   u3.username as approved_by_username,
                   COUNT(ir.id) as total_items,
                   COUNT(CASE WHEN ir.actual_quantity IS NOT NULL THEN 1 END) as checked_items
            FROM inventories i
            LEFT JOIN users u1 ON i.created_by = u1.id
            LEFT JOIN users u2 ON i.responsible_person = u2.id
            LEFT JOIN users u3 ON i.approved_by = u3.id
            LEFT JOIN inventory_results ir ON i.id = ir.inventory_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (!isAdminOrAccountant) {
            query += ` AND i.responsible_person = $${paramIndex}`;
            params.push(decoded.id);
            paramIndex++;
        }

        query += ` GROUP BY i.id, u1.username, u2.username, u3.username ORDER BY i.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ inventories: result.rows });
    } catch (error) {
        console.error("Ошибка получения инвентаризаций:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Получение деталей инвентаризации
app.get("/inventories/:id", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const inventoryId = parseInt(req.params.id);
        const isAdminOrAccountant = decoded.role === "admin" || decoded.role === "accountant";

        const inventoryResult = await pool.query(
            `SELECT i.*, 
                    u1.username as created_by_username,
                    u2.username as responsible_username,
                    u3.username as approved_by_username
             FROM inventories i
             LEFT JOIN users u1 ON i.created_by = u1.id
             LEFT JOIN users u2 ON i.responsible_person = u2.id
             LEFT JOIN users u3 ON i.approved_by = u3.id
             WHERE i.id = $1`,
            [inventoryId]
        );

        if (inventoryResult.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        const inventory = inventoryResult.rows[0];

        const canView = isAdminOrAccountant || decoded.id === inventory.responsible_person;
        if (!canView) {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const categoriesResult = await pool.query(
            `SELECT ic.category_id, c.name 
             FROM inventory_categories ic
             LEFT JOIN materialcategories c ON ic.category_id = c.id
             WHERE ic.inventory_id = $1`,
            [inventoryId]
        );

        const materialsResult = await pool.query(
            `SELECT im.material_id, m.name, m.code
             FROM inventory_materials im
             LEFT JOIN materials m ON im.material_id = m.id
             WHERE im.inventory_id = $1`,
            [inventoryId]
        );

        const resultsResult = await pool.query(
            `SELECT ir.*, m.name, m.code, m.unit
             FROM inventory_results ir
             LEFT JOIN materials m ON ir.material_id = m.id
             WHERE ir.inventory_id = $1
             ORDER BY m.name`,
            [inventoryId]
        );

        res.json({
            inventory: inventory,
            categories: categoriesResult.rows,
            selected_materials: materialsResult.rows,
            results: resultsResult.rows
        });
    } catch (error) {
        console.error("Ошибка получения инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Создание инвентаризации (только admin/accountant)
app.post("/inventories", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin" && decoded.role !== "accountant") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const { title, responsible_person, start_date, end_date, description, categories, materials } = req.body;

        if (!title || !responsible_person || !start_date || !end_date) {
            return res.status(400).json({ error: "Заполните обязательные поля" });
        }

        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ error: "Дата начала не может быть позже даты окончания" });
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const inventoryResult = await client.query(
                `INSERT INTO inventories (title, created_by, responsible_person, start_date, end_date, description, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'draft')
                 RETURNING *`,
                [title, decoded.id, responsible_person, start_date, end_date, description || null]
            );

            const inventory = inventoryResult.rows[0];

            if (categories && categories.length > 0) {
                for (const categoryId of categories) {
                    await client.query(`INSERT INTO inventory_categories (inventory_id, category_id) VALUES ($1, $2)`, [inventory.id, categoryId]);
                }
            }

            if (materials && materials.length > 0) {
                for (const materialId of materials) {
                    await client.query(`INSERT INTO inventory_materials (inventory_id, material_id) VALUES ($1, $2)`, [inventory.id, materialId]);
                }
            }

            let materialsQuery = `
                SELECT m.id, m.name, m.code, m.unit, m.quantity
                FROM materials m
                WHERE 1=1
            `;
            const queryParams = [];

            if (categories && categories.length > 0) {
                materialsQuery += ` AND m.category_id = ANY($${queryParams.length + 1})`;
                queryParams.push(categories);
            }

            if (materials && materials.length > 0) {
                materialsQuery += ` AND m.id = ANY($${queryParams.length + 1})`;
                queryParams.push(materials);
            }

            const materialsList = await client.query(materialsQuery, queryParams);

            for (const material of materialsList.rows) {
                await client.query(
                    `INSERT INTO inventory_results (inventory_id, material_id, system_quantity)
                     VALUES ($1, $2, $3)`,
                    [inventory.id, material.id, material.quantity]
                );
            }

            await client.query("COMMIT");

            Logger.setCurrentInventoryId(inventoryId);
            await Logger.inventoryCreated(decoded.id, decoded.username, title, inventory.id, inventoryId);

            res.json({
                message: "Инвентаризация создана",
                inventory: inventory
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Ошибка создания инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.put("/inventories/:id", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const inventoryId = parseInt(req.params.id);
        const { title, responsible_person, start_date, end_date, description } = req.body;

        const oldInventory = await pool.query("SELECT title, responsible_person, start_date, end_date, description FROM inventories WHERE id = $1", [inventoryId]);

        if (oldInventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        const oldData = oldInventory.rows[0];

        const formatDateForCompare = (date) => {
            if (!date) return null;
            if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}/)) {
                return date;
            }
            const d = new Date(date);
            return d.toISOString().split("T")[0];
        };

        const oldStartDate = formatDateForCompare(oldData.start_date);
        const newStartDate = start_date ? formatDateForCompare(start_date) : null;
        const oldEndDate = formatDateForCompare(oldData.end_date);
        const newEndDate = end_date ? formatDateForCompare(end_date) : null;

        const changes = [];
        if (title && title !== oldData.title) {
            changes.push(`название: "${oldData.title}" → "${title}"`);
        }
        if (responsible_person && responsible_person !== oldData.responsible_person) {
            changes.push("ответственный изменен");
        }
        if (start_date && oldStartDate !== newStartDate) {
            changes.push(`дата начала: ${oldStartDate} → ${newStartDate}`);
        }
        if (end_date && oldEndDate !== newEndDate) {
            changes.push(`дата окончания: ${oldEndDate} → ${newEndDate}`);
        }
        if (description !== undefined && description !== oldData.description) {
            changes.push("описание изменено");
        }

        const result = await pool.query(
            `UPDATE inventories 
             SET title = COALESCE($1, title),
                 responsible_person = COALESCE($2, responsible_person),
                 start_date = COALESCE($3, start_date),
                 end_date = COALESCE($4, end_date),
                 description = COALESCE($5, description),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [title, responsible_person, start_date, end_date, description, inventoryId]
        );

        if (changes.length > 0) {
            Logger.setCurrentInventoryId(inventoryId);
            await Logger.inventoryUpdated(decoded.id, decoded.username, oldData.title, changes.join(", "), inventoryId);
        }

        res.json({
            message: "Инвентаризация обновлена",
            inventory: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка обновления инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Начать инвентаризацию (только ответственный)
app.put("/inventories/:id/start", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const inventoryId = parseInt(req.params.id);

        const inventory = await pool.query("SELECT title, responsible_person, status FROM inventories WHERE id = $1", [inventoryId]);

        if (inventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        if (inventory.rows[0].responsible_person !== decoded.id) {
            return res.status(403).json({ error: "Только ответственный может начать инвентаризацию" });
        }

        if (inventory.rows[0].status !== "draft") {
            return res.status(400).json({ error: "Инвентаризация уже начата или завершена" });
        }

        await pool.query(`UPDATE inventories SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [inventoryId]);

        Logger.setCurrentInventoryId(inventoryId);
        await Logger.inventoryStarted(decoded.id, decoded.username, inventory.rows[0].title, inventoryId);

        res.json({ message: "Инвентаризация начата" });
    } catch (error) {
        console.error("Ошибка начала инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Сохранение результатов (черновик)
app.put("/inventories/:id/results", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const inventoryId = parseInt(req.params.id);
        const { results } = req.body;

        const inventory = await pool.query("SELECT title, responsible_person, status FROM inventories WHERE id = $1", [inventoryId]);

        if (inventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        if (inventory.rows[0].responsible_person !== decoded.id) {
            return res.status(403).json({ error: "Только ответственный может сохранять результаты" });
        }

        if (inventory.rows[0].status !== "in_progress") {
            return res.status(400).json({ error: "Инвентаризация не в процессе" });
        }

        for (const result of results) {
            await pool.query(
                `UPDATE inventory_results 
                 SET actual_quantity = $1, reason = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE inventory_id = $3 AND material_id = $4`,
                [result.actual_quantity, result.reason || null, inventoryId, result.material_id]
            );
        }

        await Logger.inventorySaved(decoded.id, decoded.username, inventory.rows[0].title, inventoryId);

        res.json({ message: "Результаты сохранены" });
    } catch (error) {
        console.error("Ошибка сохранения результатов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Завершить инвентаризацию и отправить на проверку
app.put("/inventories/:id/complete", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const inventoryId = parseInt(req.params.id);

        const inventory = await pool.query("SELECT title, responsible_person, status FROM inventories WHERE id = $1", [inventoryId]);

        if (inventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        if (inventory.rows[0].responsible_person !== decoded.id) {
            return res.status(403).json({ error: "Только ответственный может завершить инвентаризацию" });
        }

        if (inventory.rows[0].status !== "in_progress") {
            return res.status(400).json({ error: "Инвентаризация не в процессе" });
        }

        const checkResult = await pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN actual_quantity IS NOT NULL THEN 1 END) as checked FROM inventory_results WHERE inventory_id = $1", [inventoryId]);

        if (checkResult.rows[0].total !== checkResult.rows[0].checked) {
            return res.status(400).json({ error: "Не все товары проверены" });
        }

        await pool.query(`UPDATE inventories SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [inventoryId]);

        Logger.setCurrentInventoryId(inventoryId);
        await Logger.inventoryCompleted(decoded.id, decoded.username, inventory.rows[0].title, inventoryId);

        res.json({ message: "Инвентаризация завершена и отправлена на проверку" });
    } catch (error) {
        console.error("Ошибка завершения инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Подтвердить инвентаризацию (admin/accountant)
app.put("/inventories/:id/approve", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin" && decoded.role !== "accountant") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const inventoryId = parseInt(req.params.id);

        const inventory = await pool.query("SELECT title, status FROM inventories WHERE id = $1", [inventoryId]);

        if (inventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        if (inventory.rows[0].status !== "completed") {
            return res.status(400).json({ error: "Инвентаризация не завершена" });
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const results = await client.query(
                `SELECT ir.*, m.quantity as current_quantity
                 FROM inventory_results ir
                 LEFT JOIN materials m ON ir.material_id = m.id
                 WHERE ir.inventory_id = $1 AND ir.actual_quantity IS NOT NULL AND ir.actual_quantity != ir.system_quantity`,
                [inventoryId]
            );

            for (const result of results.rows) {
                await client.query("UPDATE materials SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [result.actual_quantity, result.material_id]);
            }

            await client.query(
                `UPDATE inventories 
                 SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [decoded.id, inventoryId]
            );

            await client.query("COMMIT");

            await Logger.inventoryApproved(decoded.id, decoded.username, inventory.rows[0].title, results.rows.length, inventoryId);

            res.json({ message: "Инвентаризация подтверждена, остатки обновлены" });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Ошибка подтверждения инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Отмена инвентаризации (admin)
app.put("/inventories/:id/cancel", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const inventoryId = parseInt(req.params.id);

        const inventory = await pool.query("SELECT title FROM inventories WHERE id = $1", [inventoryId]);

        if (inventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        await pool.query(`UPDATE inventories SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, cancelled_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [decoded.id, inventoryId]);

        Logger.setCurrentInventoryId(inventoryId);
        await Logger.inventoryCancelled(decoded.id, decoded.username, inventory.rows[0].title, inventoryId);

        res.json({ message: "Инвентаризация отменена" });
    } catch (error) {
        console.error("Ошибка отмены инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Удаление инвентаризации (admin)
app.delete("/inventories/:id", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Недостаточно прав" });
        }

        const inventoryId = parseInt(req.params.id);

        const inventory = await pool.query("SELECT title FROM inventories WHERE id = $1", [inventoryId]);

        if (inventory.rows.length === 0) {
            return res.status(404).json({ error: "Инвентаризация не найдена" });
        }

        await pool.query("DELETE FROM inventories WHERE id = $1", [inventoryId]);

        Logger.setCurrentInventoryId(inventoryId);
        await Logger.inventoryDeleted(decoded.id, decoded.username, inventory.rows[0].title, inventoryId);

        res.json({ message: "Инвентаризация удалена" });
    } catch (error) {
        console.error("Ошибка удаления инвентаризации:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// =========== DASHBOARD API ===========

// Метрики для дашборда
app.get("/dashboard/metrics", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { startDate, endDate } = req.query;

        let start = startDate;
        let end = endDate;

        if (!start || !end) {
            const now = new Date();
            start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
        }

        const materialsResult = await pool.query("SELECT COUNT(*) as total FROM materials");
        const totalMaterials = parseInt(materialsResult.rows[0].total);

        const quantityResult = await pool.query("SELECT COALESCE(SUM(quantity), 0) as total FROM materials");
        const totalQuantity = parseInt(quantityResult.rows[0].total);

        const pendingRequestsResult = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN request_type = 'incoming' THEN 1 END) as incoming,
                COUNT(CASE WHEN request_type = 'outgoing' THEN 1 END) as outgoing
            FROM material_requests 
            WHERE status = 'pending'
        `);
        const pendingRequests = {
            total: parseInt(pendingRequestsResult.rows[0].total),
            incoming: parseInt(pendingRequestsResult.rows[0].incoming),
            outgoing: parseInt(pendingRequestsResult.rows[0].outgoing)
        };

        const completedRequestsResult = await pool.query(
            `
            SELECT COUNT(*) as total
            FROM material_requests 
            WHERE status = 'approved' 
            AND created_at::date BETWEEN $1 AND $2
        `,
            [start, end]
        );
        const completedRequests = parseInt(completedRequestsResult.rows[0].total);

        const previousMonthStart = new Date(start);
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
        const previousMonthEnd = new Date(end);
        previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);

        const previousMonthResult = await pool.query(
            `
            SELECT COUNT(*) as total
            FROM material_requests 
            WHERE status = 'approved' 
            AND created_at::date BETWEEN $1 AND $2
        `,
            [previousMonthStart.toISOString().split("T")[0], previousMonthEnd.toISOString().split("T")[0]]
        );
        const previousMonthCompleted = parseInt(previousMonthResult.rows[0].total);

        const completedChange = previousMonthCompleted > 0 ? Math.round(((completedRequests - previousMonthCompleted) / previousMonthCompleted) * 100) : completedRequests > 0 ? 100 : 0;

        res.json({
            total_materials: totalMaterials,
            total_quantity: totalQuantity,
            pending_requests: pendingRequests,
            completed_requests: completedRequests,
            completed_change: completedChange
        });
    } catch (error) {
        console.error("Ошибка получения метрик:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// График движения товаров
app.get("/dashboard/movement", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Укажите даты" });
        }

        const result = await pool.query(
            `
            SELECT 
                r.created_at::date as date,
                r.request_type,
                SUM(ri.quantity) as total_quantity
            FROM material_requests r
            JOIN material_requests_items ri ON r.id = ri.request_id
            WHERE r.status = 'approved'
            AND r.created_at::date BETWEEN $1 AND $2
            GROUP BY r.created_at::date, r.request_type
            ORDER BY date ASC
        `,
            [startDate, endDate]
        );

        const dateMap = new Map();

        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            dateMap.set(dateStr, { date: dateStr, incoming: 0, outgoing: 0 });
        }

        result.rows.forEach((row) => {
            const dateStr = row.date.toISOString().split("T")[0];
            const data = dateMap.get(dateStr);
            if (data) {
                if (row.request_type === "incoming") {
                    data.incoming += parseInt(row.total_quantity);
                } else {
                    data.outgoing += parseInt(row.total_quantity);
                }
            }
        });

        const chartData = Array.from(dateMap.values());

        res.json({ data: chartData });
    } catch (error) {
        console.error("Ошибка получения данных движения:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Статус инвентаризаций для дашборда
app.get("/dashboard/inventory-status", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                status,
                COUNT(*) as count
            FROM inventories
        `;
        const params = [];

        if (startDate && endDate) {
            query += ` WHERE created_at::date BETWEEN $1 AND $2`;
            params.push(startDate, endDate);
        }

        query += ` GROUP BY status`;

        const result = await pool.query(query, params);

        const statusMap = {
            draft: { name: "Черновики", count: 0, color: "#f59e0b" },
            in_progress: { name: "В процессе", count: 0, color: "#3b82f6" },
            completed: { name: "Завершены", count: 0, color: "#8b5cf6" },
            approved: { name: "Утверждены", count: 0, color: "#10b981" },
            cancelled: { name: "Отменены", count: 0, color: "#ef4444" }
        };

        result.rows.forEach((row) => {
            if (statusMap[row.status]) {
                statusMap[row.status].count = parseInt(row.count);
            }
        });

        const data = Object.values(statusMap).filter((item) => item.count > 0);
        const total = data.reduce((sum, item) => sum + item.count, 0);

        res.json({ data, total });
    } catch (error) {
        console.error("Ошибка получения статуса инвентаризаций:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Статус заявок для дашборда
app.get("/dashboard/requests-status", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                status,
                COUNT(*) as count
            FROM material_requests
        `;
        const params = [];

        if (startDate && endDate) {
            query += ` WHERE created_at::date BETWEEN $1 AND $2`;
            params.push(startDate, endDate);
        }

        query += ` GROUP BY status`;

        const result = await pool.query(query, params);

        const statusMap = {
            pending: { name: "На рассмотрении", count: 0, color: "#f59e0b" },
            approved: { name: "Подтверждены", count: 0, color: "#10b981" },
            rejected: { name: "Отклонены", count: 0, color: "#ef4444" }
        };

        result.rows.forEach((row) => {
            if (statusMap[row.status]) {
                statusMap[row.status].count = parseInt(row.count);
            }
        });

        const data = Object.values(statusMap).filter((item) => item.count > 0);
        const total = data.reduce((sum, item) => sum + item.count, 0);

        res.json({ data, total });
    } catch (error) {
        console.error("Ошибка получения статуса заявок:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// =========== REPORTS API ===========

// Отчет: Движение материалов
app.get("/reports/material-movement", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate, categoryId, materialId, type } = req.query;

        let query = `
            SELECT 
                r.created_at::date as date,
                r.title as request_title,
                r.request_type,
                m.id as material_id,
                m.name as material_name,
                m.code,
                c.name as category_name,
                ri.quantity,
                u.username as created_by_username,
                r.status
            FROM material_requests r
            JOIN material_requests_items ri ON r.id = ri.request_id
            JOIN materials m ON ri.material_id = m.id
            LEFT JOIN materialCategories c ON m.category_id = c.id
            LEFT JOIN users u ON r.created_by = u.id
            WHERE r.status = 'approved'
            AND r.created_at::date BETWEEN $1 AND $2
        `;

        const params = [startDate, endDate];
        let paramIndex = 3;

        if (categoryId && categoryId !== "all") {
            query += ` AND m.category_id = $${paramIndex}`;
            params.push(categoryId);
            paramIndex++;
        }

        if (materialId && materialId !== "all") {
            query += ` AND m.id = $${paramIndex}`;
            params.push(materialId);
            paramIndex++;
        }

        if (type && type !== "all") {
            query += ` AND r.request_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(query, params);

        let totalIncoming = 0;
        let totalOutgoing = 0;

        result.rows.forEach((row) => {
            if (row.request_type === "incoming") {
                totalIncoming += parseInt(row.quantity);
            } else {
                totalOutgoing += parseInt(row.quantity);
            }
        });

        res.json({
            data: result.rows,
            summary: {
                incoming: totalIncoming,
                outgoing: totalOutgoing,
                turnover: totalIncoming + totalOutgoing
            }
        });
    } catch (error) {
        console.error("Ошибка получения отчета движения материалов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Отчет: Заявки
app.get("/reports/requests", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate, status, type, userId } = req.query;

        let query = `
            SELECT 
                r.id,
                r.title,
                r.request_type,
                r.status,
                r.created_at,
                r.reviewed_at,
                r.rejection_reason,
                u1.username as created_by_username,
                u2.username as reviewed_by_username,
                (
                    SELECT json_agg(json_build_object('name', m.name, 'quantity', ri.quantity))
                    FROM material_requests_items ri
                    JOIN materials m ON ri.material_id = m.id
                    WHERE ri.request_id = r.id
                    LIMIT 3
                ) as items_preview
            FROM material_requests r
            LEFT JOIN users u1 ON r.created_by = u1.id
            LEFT JOIN users u2 ON r.reviewed_by = u2.id
            WHERE r.created_at::date BETWEEN $1 AND $2
        `;

        const params = [startDate, endDate];
        let paramIndex = 3;

        if (status && status !== "all") {
            query += ` AND r.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (type && type !== "all") {
            query += ` AND r.request_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        if (userId && userId !== "all") {
            query += ` AND r.created_by = $${paramIndex}`;
            params.push(parseInt(userId));
            paramIndex++;
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(query, params);

        let pending = 0,
            approved = 0,
            rejected = 0;
        result.rows.forEach((row) => {
            if (row.status === "pending") pending++;
            else if (row.status === "approved") approved++;
            else if (row.status === "rejected") rejected++;
        });

        res.json({
            data: result.rows,
            summary: { pending, approved, rejected, total: result.rows.length }
        });
    } catch (error) {
        console.error("Ошибка получения отчета заявок:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Отчет: Оборотно-сальдовая ведомость (ОСВ)
app.get("/reports/turnover-balance", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate, categoryId } = req.query;

        let materialsQuery = `
            SELECT 
                m.id,
                m.name,
                m.code,
                m.unit,
                m.quantity as current_quantity,
                c.name as category_name
            FROM materials m
            LEFT JOIN materialCategories c ON m.category_id = c.id
            WHERE 1=1
        `;

        const materialsParams = [];
        if (categoryId && categoryId !== "all") {
            materialsQuery += ` AND m.category_id = $1`;
            materialsParams.push(categoryId);
        }
        materialsQuery += ` ORDER BY m.name`;

        const materialsResult = await pool.query(materialsQuery, materialsParams);

        const results = [];

        for (const material of materialsResult.rows) {
            const startQuantityResult = await pool.query(
                `
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN r.request_type = 'incoming' THEN ri.quantity
                        WHEN r.request_type = 'outgoing' THEN -ri.quantity
                        ELSE 0
                    END
                ), 0) as change_before
                FROM material_requests r
                JOIN material_requests_items ri ON r.id = ri.request_id
                WHERE ri.material_id = $1
                AND r.status = 'approved'
                AND r.created_at::date < $2
            `,
                [material.id, startDate]
            );

            const changeBefore = parseInt(startQuantityResult.rows[0].change_before);
            const openingBalance = material.current_quantity - changeBefore;

            const incomingResult = await pool.query(
                `
                SELECT COALESCE(SUM(ri.quantity), 0) as total
                FROM material_requests r
                JOIN material_requests_items ri ON r.id = ri.request_id
                WHERE ri.material_id = $1
                AND r.status = 'approved'
                AND r.request_type = 'incoming'
                AND r.created_at::date BETWEEN $2 AND $3
            `,
                [material.id, startDate, endDate]
            );

            const outgoingResult = await pool.query(
                `
                SELECT COALESCE(SUM(ri.quantity), 0) as total
                FROM material_requests r
                JOIN material_requests_items ri ON r.id = ri.request_id
                WHERE ri.material_id = $1
                AND r.status = 'approved'
                AND r.request_type = 'outgoing'
                AND r.created_at::date BETWEEN $2 AND $3
            `,
                [material.id, startDate, endDate]
            );

            const incoming = parseInt(incomingResult.rows[0].total);
            const outgoing = parseInt(outgoingResult.rows[0].total);
            const closingBalance = openingBalance + incoming - outgoing;

            results.push({
                id: material.id,
                name: material.name,
                code: material.code,
                unit: material.unit,
                category_name: material.category_name || "Без категории",
                opening_balance: openingBalance,
                incoming: incoming,
                outgoing: outgoing,
                closing_balance: closingBalance
            });
        }

        const filteredResults = results.filter((r) => r.opening_balance !== 0 || r.incoming !== 0 || r.outgoing !== 0 || r.closing_balance !== 0);
        const summary = {
            total_opening: filteredResults.reduce((sum, r) => sum + r.opening_balance, 0),
            total_incoming: filteredResults.reduce((sum, r) => sum + r.incoming, 0),
            total_outgoing: filteredResults.reduce((sum, r) => sum + r.outgoing, 0),
            total_closing: filteredResults.reduce((sum, r) => sum + r.closing_balance, 0)
        };

        res.json({ data: filteredResults, summary });
    } catch (error) {
        console.error("Ошибка получения ОСВ:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Отчет: Активность пользователей
app.get("/reports/user-activity", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const { startDate, endDate } = req.query;

        const result = await pool.query(
            `
            SELECT 
                u.id,
                u.username,
                u.name,
                u.secondname,
                u.role,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM material_requests r 
                    WHERE r.created_by = u.id 
                    AND r.created_at::date BETWEEN $1 AND $2
                ), 0) as requests_created,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM material_requests r 
                    WHERE r.reviewed_by = u.id 
                    AND r.status = 'approved'
                    AND r.reviewed_at::date BETWEEN $1 AND $2
                ), 0) as requests_approved,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM material_requests r 
                    WHERE r.reviewed_by = u.id 
                    AND r.status = 'rejected'
                    AND r.reviewed_at::date BETWEEN $1 AND $2
                ), 0) as requests_rejected,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM inventories i 
                    WHERE i.responsible_person = u.id 
                    AND i.status = 'approved'
                    AND i.completed_at::date BETWEEN $1 AND $2
                ), 0) as inventories_completed
            FROM users u
            ORDER BY requests_created DESC
        `,
            [startDate, endDate]
        );

        res.json({ data: result.rows });
    } catch (error) {
        console.error("Ошибка получения активности пользователей:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Получение списка материалов для фильтров
app.get("/reports/materials-list", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const result = await pool.query(`
            SELECT id, name, code, category_id
            FROM materials
            ORDER BY name
        `);

        res.json({ materials: result.rows });
    } catch (error) {
        console.error("Ошибка получения списка материалов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Получение списка пользователей для фильтров
app.get("/reports/users-list", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }

        const result = await pool.query(`
            SELECT id, username, name, secondname, role
            FROM users
            ORDER BY name, secondname
        `);

        res.json({ users: result.rows });
    } catch (error) {
        console.error("Ошибка получения списка пользователей:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// тест
app.get("/test", (req, res) => {
    res.json({ message: "hello world" });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
