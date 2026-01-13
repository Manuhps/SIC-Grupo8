const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Avaliacao = db.define('Avaliacao', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANTE: Em microserviços, não fazemos foreign key constraints
        // Apenas guardamos o ID
    },
    alojamento_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // IMPORTANTE: Pode ser null se for avaliação de evento
        // Apenas guardamos o ID
    },
    evento_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // IMPORTANTE: Pode ser null se for avaliação de alojamento
        // Apenas guardamos o ID
    },
    pontuacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'avaliacoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Avaliacao;
