const { Pool } = require('pg');
const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

class Logger {
    static currentRequestId = null;

    static setCurrentRequestId(requestId) {
        this.currentRequestId = requestId;
    }

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

    // Вход в систему
    static async login(userId, username) {
        await this.log(userId, 'login', 'Вход в систему',
            `[user:${userId}:${username}] вошел в систему`);
    }

    static async logout(userId, username) {
        await this.log(userId, 'logout', 'Выход из системы',
            `[user:${userId}:${username}] вышел из системы`);
    }

    // Создание пользователя
    static async userCreated(adminId, adminUsername, createdUsername, createdUserId) {
        await this.log(
            adminId,
            'user_created',
            'Создание пользователя',
            `[user:${adminId}:${adminUsername}] создал пользователя [user:${createdUserId}:${createdUsername}]`
        );
    }

    // Удаление пользователя
    static async userDeleted(adminId, adminUsername, deletedUsername, deletedUserId) {
        await this.log(
            adminId,
            'user_deleted',
            'Удаление пользователя',
            `[user:${adminId}:${adminUsername}] удалил пользователя [user:${deletedUserId}:${deletedUsername}]`
        );
    }

    // Профиль
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

    // Бэкапы
    static async backupCreated(userId, username, backupName) {
        await this.log(
            userId,
            'backup_created',
            'Создание бэкапа',
            `[user:${userId}:${username}] создал бэкап: ${backupName}`
        );
    }

    static async backupDownloaded(userId, username, backupName) {
        await this.log(
            userId,
            'backup_downloaded',
            'Скачивание бэкапа',
            `[user:${userId}:${username}] скачал бэкап: ${backupName}`
        );
    }

    static async backupDeleted(userId, username, backupName) {
        await this.log(
            userId,
            'backup_deleted',
            'Удаление бэкапа',
            `[user:${userId}:${username}] удалил бэкап: ${backupName}`
        );
    }

    // Материалы
    static async materialCreated(userId, username, materialName) {
        await this.log(
            userId,
            'material_created',
            'Создание материала',
            `[user:${userId}:${username}] создал материал: ${materialName}`
        );
    }

    static async materialUpdated(userId, username, materialName, changes) {
        await this.log(
            userId,
            'material_updated',
            'Изменение материала',
            `[user:${userId}:${username}] изменил материал "${materialName}": ${changes}`
        );
    }

    static async materialDeleted(userId, username, materialName) {
        await this.log(
            userId,
            'material_deleted',
            'Удаление материала',
            `[user:${userId}:${username}] удалил материал: ${materialName}`
        );
    }

    // Категории
    static async categoryCreated(userId, username, categoryName) {
        await this.log(
            userId,
            'category_created',
            'Создание категории',
            `[user:${userId}:${username}] создал категорию: ${categoryName}`
        );
    }

    static async categoryUpdated(userId, username, categoryName, changes) {
        await this.log(
            userId,
            'category_updated',
            'Изменение категории',
            `[user:${userId}:${username}] изменил категорию "${categoryName}": ${changes}`
        );
    }

    static async categoryDeleted(userId, username, categoryName) {
        await this.log(
            userId,
            'category_deleted',
            'Удаление категории',
            `[user:${userId}:${username}] удалил категорию: ${categoryName}`
        );
    }

    // Заявки
    static async requestCreated(userId, username, title, requestType, itemsList) {
        const typeText = requestType === 'incoming' ? 'приход' : 'расход';
        const requestLink = this.currentRequestId ? `[request:${this.currentRequestId}]` : '';
        await this.log(
            userId,
            'request_created',
            'Создание заявки',
            `[user:${userId}:${username}] создал ${requestLink} "${title}" на ${typeText}`
        );
    }

    static async requestApproved(userId, username, title, requestType, itemsList) {
        const typeText = requestType === 'incoming' ? 'приход' : 'расход';
        const requestLink = this.currentRequestId ? `[request:${this.currentRequestId}]` : '';
        await this.log(
            userId,
            'request_approved',
            'Подтверждение заявки',
            `[user:${userId}:${username}] подтвердил ${requestLink} "${title}" на ${typeText}`
        );
    }

    static async requestRejected(userId, username, title, requestType, rejectionReason) {
        const typeText = requestType === 'incoming' ? 'приход' : 'расход';
        const requestLink = this.currentRequestId ? `[request:${this.currentRequestId}]` : '';
        await this.log(
            userId,
            'request_rejected',
            'Отклонение заявки',
            `[user:${userId}:${username}] отклонил ${requestLink} "${title}" на ${typeText}. Причина: ${rejectionReason}`
        );
    }


    // Инвентаризация
    static async inventoryCreated(userId, username, title, inventoryId) {
        await this.log(userId, 'inventory_created', 'Создание инвентаризации',
            `[user:${userId}:${username}] создал инвентаризацию [inventory:${inventoryId}] "${title}"`);
    }

    static async inventoryStarted(userId, username, title, inventoryId) {
        await this.log(userId, 'inventory_started', 'Начало инвентаризации',
            `[user:${userId}:${username}] начал инвентаризацию [inventory:${inventoryId}] "${title}"`);
    }

    static async inventorySaved(userId, username, title, inventoryId) {
        await this.log(userId, 'inventory_saved', 'Сохранение результатов',
            `[user:${userId}:${username}] сохранил результаты инвентаризации [inventory:${inventoryId}] "${title}"`);
    }

    static async inventoryCompleted(userId, username, title, inventoryId) {
        await this.log(userId, 'inventory_completed', 'Завершение инвентаризации',
            `[user:${userId}:${username}] завершил инвентаризацию [inventory:${inventoryId}] "${title}" и отправил на проверку`);
    }

    static async inventoryApproved(userId, username, title, changesCount, inventoryId) {
        await this.log(userId, 'inventory_approved', 'Подтверждение инвентаризации',
            `[user:${userId}:${username}] подтвердил инвентаризацию [inventory:${inventoryId}] "${title}", обновлено ${changesCount} позиций`);
    }

    static async inventoryCancelled(userId, username, title, inventoryId) {
        await this.log(userId, 'inventory_cancelled', 'Отмена инвентаризации',
            `[user:${userId}:${username}] отменил инвентаризацию [inventory:${inventoryId}] "${title}"`);
    }

    static async inventoryUpdated(userId, username, title, changes, inventoryId) {
        await this.log(userId, 'inventory_updated', 'Изменение инвентаризации',
            `[user:${userId}:${username}] изменил инвентаризацию [inventory:${inventoryId}] "${title}": ${changes}`);
    }

    static async inventoryDeleted(userId, username, title, inventoryId) {
        await this.log(userId, 'inventory_deleted', 'Удаление инвентаризации',
            `[user:${userId}:${username}] удалил инвентаризацию [inventory:${inventoryId}] "${title}"`);
    }
}

module.exports = Logger;