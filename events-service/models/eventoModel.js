const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Evento = db.define('Evento', {
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
    data_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    data_fim: {
        type: DataTypes.DATE,
        allowNull: true
    },
    local: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    preco: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    tipo: {
        type: DataTypes.ENUM('cultural', 'academico', 'lazer'),
        allowNull: false
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // IMPORTANTE: Guardamos apenas o ID do organizador, não a relação completa
    organizador_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('agendado', 'concluido', 'cancelado'),
        defaultValue: 'agendado',
        allowNull: false
    }
}, {
    tableName: 'eventos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Evento;
