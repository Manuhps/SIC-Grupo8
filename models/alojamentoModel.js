const { DataTypes } = require('sequelize');
const sequelize = require('../../connection');


const Alojamento = sequelize.define("Alojamento", {
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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    zona: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('quarto_privado', 'quarto_partilhado', 'apartamento', 'casa'),
        allowNull: false
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: false
    },
    proprietario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Alojamento; 