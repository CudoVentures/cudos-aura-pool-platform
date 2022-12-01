require('dotenv').config({ path: `${__dirname}/../../../../config/.env` });

module.exports = {
    development: {
        username: process.env.App_Database_User,
        password: process.env.App_Database_Pass,
        database: process.env.App_Database_Db_Name,
        host: process.env.App_Database_Host,
        port: 5432,
        dialect: 'postgres',
    },
    //   private_testnet: {
    //     username: process.env.CI_DB_USERNAME,
    //     password: process.env.CI_DB_PASSWORD,
    //     database: process.env.CI_DB_NAME,
    //     host: '127.0.0.1',
    //     port: process.env.DB_PORT,
    //     dialect: 'postgres',
    //   },
    //   public_testnet: {
    //     username: process.env.PROD_DB_USERNAME,
    //     password: process.env.PROD_DB_PASSWORD,
    //     database: process.env.PROD_DB_NAME,
    //     host: process.env.PROD_DB_HOSTNAME,
    //     port: process.env.DB_PORT,
    //     dialect: 'postgres',
    //   },
    //   mainnet: {
    //     username: process.env.PROD_DB_USERNAME,
    //     password: process.env.PROD_DB_PASSWORD,
    //     database: process.env.PROD_DB_NAME,
    //     host: process.env.PROD_DB_HOSTNAME,
    //     port: process.env.DB_PORT,
    //     dialect: 'postgres',
    //   },
};
