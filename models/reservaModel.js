const { DataTypes } = require('sequelize');
const sequelize = require('../../connection');
const User = require('./userModel');
const Alojamento = require('./alojamentoModel');

const Reserva = sequelize.define("Reserva", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    alojamento_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Alojamentos',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    data_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    data_fim: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendente', 'concluido', 'cancelado', 'rejeitado'),
        defaultValue: 'pendente'
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Reservas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Reserva; 