import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vacinas = sequelize.define('vacinas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fabricante: {
        type: DataTypes.STRING,
        allowNull: false
    },
    validade: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'vacinas',
    timestamps: false
});

export default Vacinas;