const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('✅ [SECURE VAULT] Connected to PostgreSQL Matrix');
});

module.exports = pool;