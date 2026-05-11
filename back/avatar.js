const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { authenticateAndCheckDB, checkAdmin } = require("./middleware/auth");
const Logger = require("./logger");
const pool = require("./config/db");

const router = express.Router();

const AVATAR_DIR = path.join(__dirname, "uploads", "avatars");
fs.ensureDirSync(AVATAR_DIR);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error("Разрешены только изображения (jpeg, jpg, png, gif, webp)"));
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});

router.post("/upload", authenticateAndCheckDB, upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Файл не загружен" });
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        const oldAvatarResult = await pool.query("SELECT avatar FROM users WHERE id = $1", [req.user.id]);
        const oldAvatar = oldAvatarResult.rows[0]?.avatar;

        if (oldAvatar) {
            const oldFilePath = path.join(__dirname, oldAvatar);
            if (await fs.pathExists(oldFilePath)) {
                await fs.unlink(oldFilePath);
            }
        }

        await pool.query("UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [avatarPath, req.user.id]);

        await Logger.log(req.user.id, "avatar_updated", "Обновление аватара", `[user:${req.user.id}:${req.user.username}] обновил аватар`);

        res.json({ message: "Аватар загружен", avatar: avatarPath });
    } catch (error) {
        console.error("Ошибка загрузки аватара:", error);
        if (req.file && (await fs.pathExists(req.file.path))) {
            await fs.unlink(req.file.path);
        }
        res.status(500).json({ error: "Ошибка загрузки аватара" });
    }
});

router.delete("/", authenticateAndCheckDB, async (req, res) => {
    try {
        const avatarResult = await pool.query("SELECT avatar FROM users WHERE id = $1", [req.user.id]);
        const avatar = avatarResult.rows[0]?.avatar;

        if (!avatar) {
            return res.status(404).json({ error: "Аватар не найден" });
        }

        const filePath = path.join(__dirname, avatar);
        if (await fs.pathExists(filePath)) {
            await fs.unlink(filePath);
        }

        await pool.query("UPDATE users SET avatar = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [req.user.id]);

        await Logger.log(req.user.id, "avatar_deleted", "Удаление аватара", `[user:${req.user.id}:${req.user.username}] удалил аватар`);

        res.json({ message: "Аватар удален" });
    } catch (error) {
        console.error("Ошибка удаления аватара:", error);
        res.status(500).json({ error: "Ошибка удаления аватара" });
    }
});

router.get("/:userId", authenticateAndCheckDB, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);
        const currentUser = req.user;
        const isAdmin = currentUser.role === "admin";
        const isSameUser = currentUser.id === targetUserId;

        if (!isAdmin && !isSameUser) {
            return res.status(403).json({ error: "Недостаточно прав для просмотра аватара" });
        }

        const result = await pool.query("SELECT avatar FROM users WHERE id = $1", [targetUserId]);
        const avatar = result.rows[0]?.avatar;

        if (!avatar) {
            return res.status(404).json({ error: "Аватар не найден" });
        }

        const filePath = path.join(__dirname, avatar);
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({ error: "Файл аватара не найден" });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error("Ошибка получения аватара:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

module.exports = router;
