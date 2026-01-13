const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('estudante', 'proprietario', 'organizador', 'admin'),
        allowNull: false,
        defaultValue: 'estudante'
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profileImg: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;

