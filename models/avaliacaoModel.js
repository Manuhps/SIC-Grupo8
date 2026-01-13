const { DataTypes } = require('sequelize');
const sequelize = require('../../connection');

const Avaliacao = sequelize.define("Avaliacoes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    alojamento_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Alojamentos',
            key: 'id'
        }
    },
    evento_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Eventos',
            key: 'id'
        }
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
    tableName: 'Avaliacoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Avaliacao; 