import { Sequelize } from "sequelize";
import configJson from '../config/config.json' assert { type: 'json' };

// CODE SMELL: leitura síncrona de arquivo de configuração durante a inicialização do módulo.
// const config = JSON.parse(readFileSync(resolve('config/config.json'), 'utf-8'))['development'];

const env = process.env.NODE_ENV || 'development';
const config = configJson[env];

const sequelize = new Sequelize({
    ...config,
    pool: {
        max: 1,
        min: 0,
        idle: 10000
    },
    logging: false
});

export default sequelize;