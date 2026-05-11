const express = require("express");
const pool = require("./config/db");
const { authenticateAndCheckDB, checkAdmin } = require("./middleware/auth");
const Logger = require("./logger");
const fs = require("fs-extra");

const router = express.Router();

// Список удаленных записей
router.get("/:entity", authenticateAndCheckDB, checkAdmin, async (req, res) => {
    const { entity } = req.params;
    let table, idField, nameField;

    switch (entity) {
        case "users":
            table = "users";
            idField = "id";
            nameField = "username";
            break;
        case "categories":
            table = "materialcategories";
            idField = "id";
            nameField = "name";
            break;
        case "materials":
            table = "materials";
            idField = "id";
            nameField = "name";
            break;
        case "backups":
            table = "backups";
            idField = "id";
            nameField = "filename";
            break;
        default:
            return res.status(400).json({ error: "Неверная сущность" });
    }

    try {
        let query = `SELECT ${idField}, ${nameField} as name, deleted_at, deleted_by, u.username as deleted_by_username
                     FROM ${table}
                     LEFT JOIN users u ON ${table}.deleted_by = u.id
                     WHERE deleted_at IS NOT NULL
                     ORDER BY deleted_at DESC`;
        const result = await pool.query(query);
        res.json({ data: result.rows });
    } catch (error) {
        console.error("Ошибка получения удалённых записей:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Восстановление
router.put("/:entity/:id/restore", authenticateAndCheckDB, checkAdmin, async (req, res) => {
    const { entity, id } = req.params;
    let table;

    switch (entity) {
        case "users":
            table = "users";
            break;
        case "categories":
            table = "materialcategories";
            break;
        case "materials":
            table = "materials";
            break;
        case "backups":
            table = "backups";
            break;
        default:
            return res.status(400).json({ error: "Неверная сущность" });
    }

    try {
        const result = await pool.query(`UPDATE ${table} SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Запись не найдена" });
        }
        await Logger.log(req.user.id, "restore", "Восстановление из корзины", `[user:${req.user.id}:${req.user.username}] восстановил ${entity.substr(0, -1)} ID:${id}`);
        res.json({ message: "Запись восстановлена" });
    } catch (error) {
        console.error("Ошибка восстановления:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Полное удаление
router.delete("/:entity/:id/permanent", authenticateAndCheckDB, checkAdmin, async (req, res) => {
    const { entity, id } = req.params;
    let table,
        filePathField = null;

    switch (entity) {
        case "users":
            table = "users";
            break;
        case "categories":
            table = "materialcategories";
            break;
        case "materials":
            table = "materials";
            break;
        case "backups":
            table = "backups";
            filePathField = "filepath";
            break;
        default:
            return res.status(400).json({ error: "Неверная сущность" });
    }

    try {
        if (filePathField) {
            const fileResult = await pool.query(`SELECT filepath FROM backups WHERE id = $1`, [id]);
            if (fileResult.rows.length > 0) {
                const filepath = fileResult.rows[0].filepath;
                if (await fs.pathExists(filepath)) {
                    await fs.unlink(filepath);
                }
            }
        }

        const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Запись не найдена" });
        }
        await Logger.log(req.user.id, "permanent_delete", "Полное удаление", `[user:${req.user.id}:${req.user.username}] навсегда удалил ${entity.substr(0, -1)} ID:${id}`);
        res.json({ message: "Запись удалена навсегда" });
    } catch (error) {
        console.error("Ошибка полного удаления:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

module.exports = router;
