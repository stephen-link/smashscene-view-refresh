const Knex = require('knex');

const knex = Knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME || 'postgres',
    },
    // pool: {
    //     min: 10,
    //     max: Number(process.env.DB_POOL_MAX) || 20,
    //     createTimeoutMillis: 30 * 1000,
    //     acquireTimeoutMillis: 15 * 1000,
    // },
});

export default knex