import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Agendamentos = sequelize.define('agendamentos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cidadaoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vacinaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    postoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    statusId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dataHora: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'agendamentos',
    timestamps: false
});

export default Agendamentos;