const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Reserva = db.define('Reserva', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    alojamento_id: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANTE: Em microserviços, não fazemos foreign key constraints
        // Apenas guardamos o ID
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANTE: Em microserviços, não fazemos foreign key constraints
        // Apenas guardamos o ID
    },
    data_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    data_fim: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado', 'concluido', 'rejeitado'),
        defaultValue: 'pendente',
        allowNull: false
    },
    total_preco: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    pagamento_status: {
        type: DataTypes.ENUM('pendente', 'pago', 'reembolsado'),
        defaultValue: 'pendente',
        allowNull: true
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'reservas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Reserva;
