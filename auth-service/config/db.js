const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'auth_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'auth-db',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log // Ativa logs para debugging
    }
);

module.exports = sequelize;