import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vacinas = sequelize.define('Vacinas', {
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
        type: DataTypes.DATEONLY,  // ✅ Usa DATEONLY em vez de DATE
        allowNull: false
    }
}, {
    tableName: 'vacinas',
    timestamps: false,
    // ✅ Personaliza a serialização JSON
    toJSON() {
        const values = Object.assign({}, this.get());
        if (values.validade) {
            values.validade = values.validade instanceof Date
                ? values.validade.toISOString().split('T')[0]
                : values.validade;
        }
        return values;
    }
});

export default Vacinas;