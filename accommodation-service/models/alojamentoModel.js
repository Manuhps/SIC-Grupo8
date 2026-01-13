const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Alojamento = db.define('Alojamento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    precoBase: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    zona: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagem: {
        type: DataTypes.STRING
    },
    // IMPORTANTE: Guardamos apenas o ID do dono, não a relação completa
    proprietario_id: { 
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Alojamento;