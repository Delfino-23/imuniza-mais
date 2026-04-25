import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cidadaos = sequelize.define('cidadaos', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true,
        unique: true,
        validate: {
            len: [11, 11],
            isNumeric: true
        }
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