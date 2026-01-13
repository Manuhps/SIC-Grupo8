const { Sequelize } = require('sequelize');

// 'reservation-db' é o nome do container MySQL definido no docker-compose
const sequelize = new Sequelize('reservation_db', 'root', 'root', {
    host: 'reservation-db',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;
