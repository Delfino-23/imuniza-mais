import { Sequelize } from "sequelize";
import { readFileSync } from "fs";
import { resolve } from "path";

const config = JSON.parse(readFileSync(resolve('config/config.json'), 'utf-8'))['development'];

const sequelize = new Sequelize({
    ...config,
    pool: {
        max: 1,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        busyTimeout: 30000  // Espera 30 segundos antes de dar "database locked"
    }
});

export default sequelize;