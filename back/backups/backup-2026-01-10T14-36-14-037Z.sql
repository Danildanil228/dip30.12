-- Резервная копия базы данных materialHousedb
-- Создано: 2026-01-10T14:36:14.249Z
-- Комментарий: 27users
-- Формат: SQL (pg_dump недоступен)

BEGIN;

-- Таблица: database_backups
INSERT INTO database_backups (id, filename, filepath, filesize, created_by, created_at, restored_at, restored_by, comment) VALUES (1, 'backup-2026-01-10T14-32-51-443Z.sql', 'C:\Users\Danil\Desktop\dip30.12\back\backups\backup-2026-01-10T14-32-51-443Z.sql', '7908', 2, '2026-01-10T14:32:51.906Z', NULL, NULL, '123');

-- Таблица: materialcategories
INSERT INTO materialcategories (id, name, description, created_by, updated_by, created_at, updated_at) VALUES (1, 'Строительные смеси и добавки', '324', 2, 2, '2026-01-09T18:15:12.475Z', '2026-01-09T18:51:31.681Z');

-- Таблица: materials
INSERT INTO materials (id, category_id, name, code, description, unit, quantity, created_by, updated_by, created_at, updated_at) VALUES (1, 1, 'Гипсовая штукатурка 25 кг КНАУФ-Ротбанд', 'ГШ-802', 'Штукатурная смесь на основе гипса КНАУФ Ротбанд предназначена для выравнивания вручную стабильных минеральных оснований. Благодаря высокой пластичности раствора смесь более удобна в выравнивании и подрезке, что положительно влияет на качество итоговой поверхности. Допускает заглаживание, что позволяет получить высококачественное основание, не требующее промежуточного шпаклевания и пригодное под оклеивание плотными обоями или окрашивание фактурной краской. Применяется на стенах и потолках внутри сухих помещений.

Особенности и преимущества:
- смесь для ручного выравнивания стен и потолков;
- удобна в применении благодаря высокой пластичности;
- пригодна к финишному заглаживанию;
- экологически чистый состав на основе природного гипса.

Обратите внимание:
При выполнении работ рекомендуем использовать средства индивидуальной защиты.

Способ применения:
Раствор распределяют по подготовленному основанию при помощи гладилки, после чего подрезают h-образным правилом по предварительно установленным маячковым профилям. Для получения поверхности, пригодной под нанесение декоративных покрытий, после подрезки следует выполнить заглаживание, используя жесткую губку и широкий шпатель из нержавеющей стали. Дальнейшая отделка возможна после полного высыхания поверхности, но не ранее чем через 7 суток.', 'кг', 0, 2, 2, '2026-01-09T18:14:37.861Z', '2026-01-09T21:12:26.438Z');

-- Таблица: notifications
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (1, 2, 'login', 'Вход в систему', '[user:2:admin] вошел в систему', true, '2026-01-09T18:12:33.256Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (2, 2, 'material_created', 'Создание материала', '[user:2:admin] создал материал: Гипсовая штукатурка 25 кг КНАУФ-Ротбанд', true, '2026-01-09T18:14:37.885Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (3, 2, 'category_created', 'Создание категории', 'Администратор admin создал категорию: Строительные смеси и добавки', true, '2026-01-09T18:15:12.499Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (4, 2, 'login', 'Вход в систему', '[user:2:admin] вошел в систему', true, '2026-01-09T18:16:11.590Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (5, 2, 'material_updated', 'Изменение материала', '[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": категория изменена', true, '2026-01-09T18:49:05.847Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (6, 2, 'category_updated', 'Изменение категории', 'Администратор admin изменил категорию "Строительные смеси и добавки": описание изменено', true, '2026-01-09T18:49:25.659Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (7, 2, 'material_updated', 'Изменение материала', '[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": категория изменена', true, '2026-01-09T18:50:18.643Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (8, 2, 'material_updated', 'Изменение материала', '[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": категория изменена', true, '2026-01-09T18:50:23.037Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (9, 2, 'profile_updated', 'Изменение профиля', '[user:2:admin] изменил данные: "name": "admin" → "Данила", "secondname": "admin" → "*", "email": "" → "d_silchenkov@mail.ru", "phone": "" → "+79118573584", "birthday": "" → "2005-08-06"', true, '2026-01-09T18:52:44.360Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (10, 2, 'login', 'Вход в систему', '[user:2:admin] вошел в систему', true, '2026-01-09T21:08:14.530Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (11, 2, 'user_created', 'Создание пользователя', '[user:2:admin] создал пользователя [user:3:ggdf28]', true, '2026-01-09T21:11:43.171Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (12, 2, 'material_updated', 'Изменение материала', '[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": единица: "шт" → "кг"', true, '2026-01-09T21:12:26.463Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (13, 2, 'login', 'Вход в систему', '[user:2:admin] вошел в систему', true, '2026-01-10T14:27:36.706Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (14, 2, 'backup_created', 'Создание бэкапа', 'Администратор admin создал бэкап: backup-2026-01-10T14-32-51-443Z.sql (7.72 KB)', true, '2026-01-10T14:32:51.930Z');
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (15, 2, 'backup_downloaded', 'Скачивание бэкапа', 'Пользователь admin скачал бэкап: backup-2026-01-10T14-32-51-443Z.sql', true, '2026-01-10T14:33:18.011Z');

-- Таблица: users
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (2, 'admin', '$2b$10$k4sEznB1SOVKFBZJR6S9QezlVXToE8H3we8to2fzqKkkVTQdEstwa', 'admin', 'Данила', '*', '2026-01-09T18:12:19.719Z', 'd_silchenkov@mail.ru', '+79118573584', '2005-08-05T20:00:00.000Z', '2026-01-09T18:52:44.323Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (3, 'ggdf28', '$2b$10$.X0O1xWiuBsVZf2aCWblZekQZBUFBBZ0/fZeJunMX5zXF0A7aPz6u', 'storekeeper', 'gfd', 'gdf', '2026-01-09T21:11:43.147Z', '', '', NULL, '2026-01-09T21:11:43.147Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (4, 'admin1', 'hashed_password_1', 'admin', 'Иван', 'Петров', '2026-01-10T14:35:47.966Z', 'admin1@example.com', '+79161234567', '1985-03-14T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (5, 'admin2', 'hashed_password_2', 'admin', 'Анна', 'Сидорова', '2026-01-10T14:35:47.966Z', 'admin2@example.com', '+79161234568', '1990-07-21T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (6, 'admin3', 'hashed_password_3', 'admin', 'Сергей', 'Козлов', '2026-01-10T14:35:47.966Z', 'admin3@example.com', '+79161234569', '1988-11-29T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (7, 'storekeeper1', 'hashed_password_4', 'storekeeper', 'Мария', 'Иванова', '2026-01-10T14:35:47.966Z', 'store1@example.com', '+79161234570', '1992-05-09T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (8, 'storekeeper2', 'hashed_password_5', 'storekeeper', 'Дмитрий', 'Смирнов', '2026-01-10T14:35:47.966Z', 'store2@example.com', '+79161234571', '1993-09-17T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (9, 'storekeeper3', 'hashed_password_6', 'storekeeper', 'Ольга', 'Кузнецова', '2026-01-10T14:35:47.966Z', 'store3@example.com', '+79161234572', '1991-02-24T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (10, 'storekeeper4', 'hashed_password_7', 'storekeeper', 'Алексей', 'Попов', '2026-01-10T14:35:47.966Z', 'store4@example.com', '+79161234573', '1994-08-13T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (11, 'storekeeper5', 'hashed_password_8', 'storekeeper', 'Елена', 'Васильева', '2026-01-10T14:35:47.966Z', 'store5@example.com', '+79161234574', '1995-12-04T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (12, 'storekeeper6', 'hashed_password_9', 'storekeeper', 'Павел', 'Петров', '2026-01-10T14:35:47.966Z', 'store6@example.com', '+79161234575', '1990-04-19T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (13, 'storekeeper7', 'hashed_password_10', 'storekeeper', 'Татьяна', 'Соколова', '2026-01-10T14:35:47.966Z', 'store7@example.com', '+79161234576', '1993-06-29T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (14, 'storekeeper8', 'hashed_password_11', 'storekeeper', 'Николай', 'Михайлов', '2026-01-10T14:35:47.966Z', 'store8@example.com', '+79161234577', '1989-10-14T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (15, 'storekeeper9', 'hashed_password_12', 'storekeeper', 'Юлия', 'Новикова', '2026-01-10T14:35:47.966Z', 'store9@example.com', '+79161234578', '1992-03-21T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (16, 'storekeeper10', 'hashed_password_13', 'storekeeper', 'Артем', 'Федоров', '2026-01-10T14:35:47.966Z', 'store10@example.com', '+79161234579', '1994-07-07T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (17, 'accountant1', 'hashed_password_14', 'accountant', 'Алиса', 'Морозова', '2026-01-10T14:35:47.966Z', 'acc1@example.com', '+79161234580', '1987-01-11T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (18, 'accountant2', 'hashed_password_15', 'accountant', 'Константин', 'Волков', '2026-01-10T14:35:47.966Z', 'acc2@example.com', '+79161234581', '1991-08-27T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (19, 'accountant3', 'hashed_password_16', 'accountant', 'Виктория', 'Алексеева', '2026-01-10T14:35:47.966Z', 'acc3@example.com', '+79161234582', '1993-04-16T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (20, 'accountant4', 'hashed_password_17', 'accountant', 'Григорий', 'Лебедев', '2026-01-10T14:35:47.966Z', 'acc4@example.com', '+79161234583', '1986-11-02T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (21, 'accountant5', 'hashed_password_18', 'accountant', 'Лариса', 'Семенова', '2026-01-10T14:35:47.966Z', 'acc5@example.com', '+79161234584', '1990-05-24T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (22, 'accountant6', 'hashed_password_19', 'accountant', 'Роман', 'Егоров', '2026-01-10T14:35:47.966Z', 'acc6@example.com', '+79161234585', '1992-09-13T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (23, 'accountant7', 'hashed_password_20', 'accountant', 'Надежда', 'Павлова', '2026-01-10T14:35:47.966Z', 'acc7@example.com', '+79161234586', '1994-02-18T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (24, 'accountant8', 'hashed_password_21', 'accountant', 'Владислав', 'Ковалев', '2026-01-10T14:35:47.966Z', 'acc8@example.com', '+79161234587', '1988-06-06T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (25, 'accountant9', 'hashed_password_22', 'accountant', 'Светлана', 'Орлова', '2026-01-10T14:35:47.966Z', 'acc9@example.com', '+79161234588', '1993-12-10T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (26, 'accountant10', 'hashed_password_23', 'accountant', 'Борис', 'Андреев', '2026-01-10T14:35:47.966Z', 'acc10@example.com', '+79161234589', '1989-03-28T20:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (27, 'accountant11', 'hashed_password_24', 'accountant', 'Ксения', 'Макарова', '2026-01-10T14:35:47.966Z', 'acc11@example.com', '+79161234590', '1995-10-07T21:00:00.000Z', '2026-01-10T14:35:47.966Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (28, 'accountant12', 'hashed_password_25', 'accountant', 'Игорь', 'Николаев', '2026-01-10T14:35:47.966Z', 'acc12@example.com', '+79161234591', '1991-07-15T21:00:00.000Z', '2026-01-10T14:35:47.966Z');

COMMIT;
