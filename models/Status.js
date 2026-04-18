import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Status = sequelize.define('statuses', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'statuses',
    timestamps: false
});

export default Status;