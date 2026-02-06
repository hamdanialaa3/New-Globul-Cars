const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment
dotenv.config({ path: path.join(__dirname, '../.env.production') });

const config = {
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/koli_media_db'
};

const pool = new Pool(config);

async function runMigration() {
    console.log('🐘 Connecting to Database...');
    const client = await pool.connect();

    try {
        console.log('📂 Reading Migration File: 001_init.sql');
        const sqlPath = path.join(__dirname, '../migrations/001_init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing Migration...');
        await client.query(sql);

        console.log('✅ Migration Applied Successfully!');
        console.log('   - Tables Created: social_posts, publish_attempts, audit_logs, dlq_jobs');
        console.log('   - Extensions Enabled: uuid-ossp');

    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
