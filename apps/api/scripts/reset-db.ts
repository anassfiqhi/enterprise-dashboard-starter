import { pool } from '../src/db/index';

async function resetDatabase() {
    try {
        console.log('🗑️  Dropping all tables...');

        // Drop tables in correct order (respecting foreign keys)
        await pool.query(`
            DROP TABLE IF EXISTS "invitation" CASCADE;
            DROP TABLE IF EXISTS "member" CASCADE;
            DROP TABLE IF EXISTS "organization" CASCADE;
            DROP TABLE IF EXISTS "account" CASCADE;
            DROP TABLE IF EXISTS "session" CASCADE;
            DROP TABLE IF EXISTS "verification" CASCADE;
            DROP TABLE IF EXISTS "orders" CASCADE;
            DROP TABLE IF EXISTS "user" CASCADE;
        `);

        console.log('✅ All tables dropped successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Reset failed:', error.message);
        process.exit(1);
    }
}

resetDatabase();
