import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistoricoVacinal = sequelize.define('historico_vacinal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cidadaoCpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        validate: {
            len: [11, 11],
            isNumeric: true
        }
    },
    vacinaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dataAplicacao: {
        type: DataTypes.DATE,
        allowNull: false
    },
    agendamentoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'historico_vacinal',
    timestamps: false
});

export default HistoricoVacinal;