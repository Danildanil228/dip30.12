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
        await this.log(userId, 'login', 'Вход в систему',
            `[user:${userId}:${username}] вошел в систему`);
    }
    static async logout(userId, username) {
        await this.log(userId, 'logout', 'Выход из системы',
            `[user:${userId}:${username}] вышел из системы`);
    }
    //  создания пользователя
    static async userCreated(adminId, adminUsername, createdUsername, createdUserId) {
        await this.log(
            adminId,
            'user_created',
            'Создание пользователя',
            `[user:${adminId}:${adminUsername}] создал пользователя [user:${createdUserId}:${createdUsername}]`
        );
    }
    //delte
    static async userDeleted(adminId, adminUsername, deletedUsername, deletedUserId) {
        await this.log(
            adminId,
            'user_deleted',
            'Удаление пользователя',
            `[user:${adminId}:${adminUsername}] удалил пользователя [user:${deletedUserId}:${deletedUsername}]`
        );
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


    //PROFILE

    static async profileUpdated(userId, username, changedFields) {
        const changesText = Object.entries(changedFields)
            .map(([field, values]) => `"${field}": "${values.old}" → "${values.new}"`)
            .join(', ');

        await this.log(
            userId,
            'profile_updated',
            'Изменение профиля',
            `[user:${userId}:${username}] изменил данные: ${changesText}`
        );
    }

    static async passwordChanged(userId, username, selfChange = true, targetUserId = null, targetUsername = null) {
        if (selfChange) {
            await this.log(
                userId,
                'password_changed',
                'Смена пароля',
                `[user:${userId}:${username}] сменил свой пароль`
            );
        } else {
            await this.log(
                userId,
                'admin_password_changed',
                'Админ сменил пароль пользователю',
                `[user:${userId}:${username}] сменил пароль пользователю [user:${targetUserId}:${targetUsername}]`
            );
        }
    }

    static async userUpdated(adminId, adminUsername, targetUserId, targetUsername, changedFields) {
        const changesText = Object.entries(changedFields)
            .map(([field, values]) => `"${field}": "${values.old}" → "${values.new}"`)
            .join(', ');

        await this.log(
            adminId,
            'admin_user_updated',
            'Админ изменил данные пользователя',
            `[user:${adminId}:${adminUsername}] изменил данные пользователя [user:${targetUserId}:${targetUsername}]: ${changesText}`
        );
    }

    static async adminPasswordChanged(adminId, adminUsername, targetUserId, targetUsername) {
        await this.log(
            adminId,
            'admin_password_changed',
            'Админ сменил пароль пользователя',
            `Администратор ${adminUsername} сменил пароль пользователю ${targetUsername}`
        );
    }


}

module.exports = Logger;