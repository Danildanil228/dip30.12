const { Pool } = require("pg");
require("dotenv").config();

const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Установите переменные окружения в файле "back/.env" ${envVar}, если файла нет, создайте по примеру back/.env.exmaple`);
    process.exit(1);
  }
}

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

module.exports = pool;