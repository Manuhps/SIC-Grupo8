const { Sequelize } = require('sequelize');

// 'review-db' é o nome do container MySQL definido no docker-compose
const sequelize = new Sequelize('review_db', 'root', 'root', {
    host: 'review-db',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;
