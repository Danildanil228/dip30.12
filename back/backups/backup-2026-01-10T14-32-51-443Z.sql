-- Резервная копия базы данных materialHousedb
-- Создано: 2026-01-10T14:32:51.851Z
-- Комментарий: 123
-- Формат: SQL (pg_dump недоступен)

BEGIN;

-- Таблица: database_backups

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

-- Таблица: users
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (2, 'admin', '$2b$10$k4sEznB1SOVKFBZJR6S9QezlVXToE8H3we8to2fzqKkkVTQdEstwa', 'admin', 'Данила', '*', '2026-01-09T18:12:19.719Z', 'd_silchenkov@mail.ru', '+79118573584', '2005-08-05T20:00:00.000Z', '2026-01-09T18:52:44.323Z');
INSERT INTO users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) VALUES (3, 'ggdf28', '$2b$10$.X0O1xWiuBsVZf2aCWblZekQZBUFBBZ0/fZeJunMX5zXF0A7aPz6u', 'storekeeper', 'gfd', 'gdf', '2026-01-09T21:11:43.147Z', '', '', NULL, '2026-01-09T21:11:43.147Z');

COMMIT;
