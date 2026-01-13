const { Sequelize } = require('sequelize');

// 'events-db' é o nome do container MySQL definido no docker-compose
const sequelize = new Sequelize('events_db', 'root', 'root', {
    host: 'events-db',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;
