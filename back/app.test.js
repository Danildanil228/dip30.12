const request = require("supertest");
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
jest.mock("pg");

const backupRoutes = require("./backup");
let app;

const createTestApp = (mockPool) => {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use("/backups", backupRoutes);
    testApp.get("/countUsers", async (req, res) => {
        try {
            const result = await mockPool.query("SELECT count(*) FROM users");
            const count = parseInt(result.rows[0].count);
            res.json({ hasUsers: count > 0 });
        } catch (error) {
            res.status(500).json({ error: "Ошибка сервера" });
        }
    });
    testApp.post("/registerFirst", async (req, res) => {
        try {
            const countResult = await mockPool.query("SELECT COUNT(*) FROM users");
            const userCount = parseInt(countResult.rows[0].count);
            if (userCount > 0) {
                return res.status(400).json({ error: "Регистрация первого пользователя уже выполнена" });
            }
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: "Заполните все поля" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await mockPool.query(
                "INSERT INTO users (username, password, role, name, secondname, email, phone, birthday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, role, name, secondname, email, phone, birthday",
                [username, hashedPassword, "admin", "admin", "admin", "", "", null],
            );
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name, secondname: user.secondname }, "key", { expiresIn: "8h" });

            res.json({ message: "Первый пользователь создан", user: user, token: token });
        } catch (error) {
            res.status(500).json({ error: "Ошибка сервера" });
        }
    });
    testApp.post("/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: "Заполните все поля" });
            }
            const result = await mockPool.query("SELECT * FROM users WHERE username = $1", [username]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: "Неверные данные" });
            }
            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "Неверные данные" });
            }
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name, secondname: user.secondname }, "key", { expiresIn: "8h" });
            res.json({ message: "Совершен вход", user: user, token: token });
        } catch (error) {
            res.status(500).json({ error: "Ошибка сервера" });
        }
    });
    testApp.get("/materials", async (req, res) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Требуется авторизация" });
        }
        res.json({ materials: [] });
    });
    testApp.get("/verifyToken", (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ valid: false });
            }
            const decoded = jwt.verify(token, "key");
            res.json({ valid: true, user: decoded });
        } catch (error) {
            res.status(401).json({ valid: false });
        }
    });
    return testApp;
};

describe("API тесты MaterialHouse", () => {
    let mockPool;
    let testApp;
    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
            connect: jest.fn(() => ({
                query: jest.fn(),
                release: jest.fn(),
            })),
        };
        Pool.mockImplementation(() => mockPool);
        testApp = createTestApp(mockPool);
    });

    // Тест - регистрация первого администратора
    test("POST /registerFirst — успешная регистрация первого администратора", async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [{ count: "0" }] });
        mockPool.query.mockResolvedValueOnce({
            rows: [{ id: 1, username: "admin", role: "admin", name: "admin", secondname: "admin" }],
        });
        const response = await request(testApp).post("/registerFirst").send({ username: "admin", password: "admin123" });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body.user).toHaveProperty("role", "admin");
    });

    // Тест - успешная авторизация
    test("POST /login — успешный вход с правильными данными", async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        mockPool.query.mockResolvedValueOnce({
            rows: [{ id: 1, username: "testuser", password: hashedPassword, role: "storekeeper", name: "Иван", secondname: "Иванов" }],
        });
        const response = await request(testApp).post("/login").send({ username: "testuser", password: "password123" });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body.user).toHaveProperty("username", "testuser");
    });

    // Тест - ошибка авторизации с неверным паролем
    test("POST /login — ошибка при неверном пароле", async () => {
        const hashedPassword = await bcrypt.hash("correctpassword", 10);
        mockPool.query.mockResolvedValueOnce({
            rows: [{ id: 1, username: "testuser", password: hashedPassword, role: "storekeeper" }],
        });
        const response = await request(testApp).post("/login").send({ username: "testuser", password: "wrongpassword" });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Неверные данные");
    });

    // Тест - ошибка авторизации с несуществующим пользователем
    test("POST /login — ошибка при несуществующем пользователе", async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });
        const response = await request(testApp).post("/login").send({ username: "nonexistent", password: "anypass" });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Неверные данные");
    });

    // Тест - доступ к защищённому ресурсу без токена
    test("GET /materials — ошибка при отсутствии токена", async () => {
        const response = await request(testApp).get("/materials");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Требуется авторизация");
    });
});
