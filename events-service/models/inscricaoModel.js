const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Inscricao = db.define('Inscricao', {
    evento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
        // NOTA: Em microserviços, não usamos foreign keys
        // Apenas guardamos o ID como referência
    },
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
        // NOTA: user_id vem do JWT token, não precisamos validar com Auth Service
    },
    status: {
        type: DataTypes.ENUM('pendente', 'concluido', 'cancelado'),
        defaultValue: 'pendente',
        allowNull: false
    },
    valor_pago: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    }
}, {
    tableName: 'inscricoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Inscricao;
