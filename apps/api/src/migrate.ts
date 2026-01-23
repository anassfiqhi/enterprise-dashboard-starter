import { pool } from './db/index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
    try {
        console.log('Running migrations...');

        const migrationFile = path.join(__dirname, '../drizzle/0000_add_orders_table.sql');
        const sql = fs.readFileSync(migrationFile, 'utf-8');

        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
