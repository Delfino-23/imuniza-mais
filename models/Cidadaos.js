import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cidadaos = sequelize.define('cidadaos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'cidadaos',
    timestamps: false
});

export default Cidadaos;