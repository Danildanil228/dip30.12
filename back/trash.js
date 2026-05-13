const express = require("express");
const path = require("path");
const pool = require("./config/db");
const { authenticateAndCheckDB, checkAdmin } = require("./middleware/auth");
const Logger = require("./logger");
const fs = require("fs-extra");

const router = express.Router();

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
        const query = `SELECT ${table}.${idField}, ${table}.${nameField} as name, ${table}.deleted_at, ${table}.deleted_by, u.username as deleted_by_username
                       FROM ${table}
                       LEFT JOIN users u ON ${table}.deleted_by = u.id
                       WHERE ${table}.deleted_at IS NOT NULL
                       ORDER BY ${table}.deleted_at DESC`;
        const result = await pool.query(query);
        res.json({ data: result.rows });
    } catch (error) {
        console.error("Ошибка получения удалённых записей:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

router.put("/:entity/:id/restore", authenticateAndCheckDB, checkAdmin, async (req, res) => {
    const { entity, id } = req.params;
    let table, nameField;

    switch (entity) {
        case "users":
            table = "users";
            nameField = "username";
            break;
        case "categories":
            table = "materialcategories";
            nameField = "name";
            break;
        case "materials":
            table = "materials";
            nameField = "name";
            break;
        case "backups":
            table = "backups";
            nameField = "filename";
            break;
        default:
            return res.status(400).json({ error: "Неверная сущность" });
    }

    try {
      
        const nameResult = await pool.query(`SELECT ${nameField} as name FROM ${table} WHERE id = $1`, [id]);
        const entityName = nameResult.rows[0]?.name || `ID:${id}`;

    
        const result = await pool.query(`UPDATE ${table} SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 RETURNING id`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Запись не найдена" });
        }


        await Logger.trashRestored(req.user.id, req.user.username, entity, id, entityName);

        res.json({ message: "Запись восстановлена" });
    } catch (error) {
        console.error("Ошибка восстановления:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

router.delete("/:entity/:id/permanent", authenticateAndCheckDB, checkAdmin, async (req, res) => {
    const { entity, id } = req.params;
    let table,
        nameField,
        filePathField = null;

    switch (entity) {
        case "users":
            table = "users";
            nameField = "username";
            const avatarResult = await pool.query("SELECT avatar FROM users WHERE id = $1", [id]);
            if (avatarResult.rows.length > 0 && avatarResult.rows[0].avatar) {
                const avatarPath = path.join(__dirname, avatarResult.rows[0].avatar);
                if (await fs.pathExists(avatarPath)) {
                    await fs.unlink(avatarPath);
                }
            }
            break;
        case "categories":
            table = "materialcategories";
            nameField = "name";
            break;
        case "materials":
            table = "materials";
            nameField = "name";
            break;
        case "backups":
            table = "backups";
            nameField = "filename";
            filePathField = "filepath";
            break;
        default:
            return res.status(400).json({ error: "Неверная сущность" });
    }

    try {
       
        const selectQuery = filePathField ? `SELECT ${nameField} as name, ${filePathField} as filepath FROM ${table} WHERE id = $1` : `SELECT ${nameField} as name FROM ${table} WHERE id = $1`;

        const infoResult = await pool.query(selectQuery, [id]);
        const entityName = infoResult.rows[0]?.name || `ID:${id}`;

  
        if (filePathField && infoResult.rows[0]?.filepath) {
            const filepath = infoResult.rows[0].filepath;
            if (await fs.pathExists(filepath)) {
                await fs.unlink(filepath);
            }
        }

        const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Запись не найдена" });
        }


        await Logger.trashPermanentDeleted(req.user.id, req.user.username, entity, id, entityName);

        res.json({ message: "Запись удалена навсегда" });
    } catch (error) {
        console.error("Ошибка полного удаления:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

module.exports = router;
