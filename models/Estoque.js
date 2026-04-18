import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Estoque = sequelize.define('estoque', {
    postoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    vacinaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'estoque',
    timestamps: false
});

export default Estoque;