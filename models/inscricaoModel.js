const { DataTypes } = require('sequelize');
const sequelize = require('../../connection');
const User = require('./userModel');
const Evento = require('./eventoModel');

const Inscricao = sequelize.define("Inscricao", {
    evento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Eventos',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pendente', 'concluido', 'cancelado'),
        defaultValue: 'pendente'
    },
    valor_pago: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'Inscricoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Inscricao; 