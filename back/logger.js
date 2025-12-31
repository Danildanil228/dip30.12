const { Pool } = require('pg');
const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

class Logger {
    static async log(userId, type, title, message) {
        try {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, type, title, message]
            );
        } catch (error) {
            console.error('Ошибка записи лога:', error);
        }
    }

    //  вход в систему
    static async login(userId, username) {
        await this.log(userId, 'login', 'Вход в систему', `Пользователь ${username} вошел в систему`);
    }

    //  выход из системы
    static async logout(userId, username) {
        await this.log(userId, 'logout', 'Выход из системы', `Пользователь ${username} вышел из системы`);
    }

    //  создания пользователя
    static async userCreated(adminId, adminName, createdUsername) {
        await this.log(adminId, 'user_created', 'Создание пользователя',
            `${adminName} создал пользователя ${createdUsername}`);
    }

    //  удалени пользователя
    static async userDeleted(adminId, adminName, deletedUsername) {
        await this.log(adminId, 'user_deleted', 'Удаление пользователя',
            `${adminName} удалил пользователя ${deletedUsername}`);
    }

    // добавлени материала
    // static async materialAdded(userId, userName, materialName) {
    //     await this.log(userId, 'material_added', 'Добавление материала', 
    //         `${userName} добавил материал: ${materialName}`);
    // }

    // изменения материала
    // static async materialUpdated(userId, userName, materialName) {
    //     await this.log(userId, 'material_updated', 'Изменение материала', 
    //         `${userName} изменил материал: ${materialName}`);
    // }

    //  удаления материала
    // static async materialDeleted(userId, userName, materialName) {
    //     await this.log(userId, 'material_deleted', 'Удаление материала', 
    //         `${userName} удалил материал: ${materialName}`);
    // }
}

module.exports = Logger;