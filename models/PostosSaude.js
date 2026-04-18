import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostosSaude = sequelize.define('postos_saude', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'postos_saude',
    timestamps: false
});

export default PostosSaude;