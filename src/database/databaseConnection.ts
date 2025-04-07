import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD, SSL } = process.env;
export { PG_DATABASE };

const pool = new Pool({
	host: PG_HOST,
	port: Number(PG_PORT) || 5432,
	database: PG_DATABASE,
	user: PG_USER,
	password: PG_PASSWORD,
	ssl: SSL === 'true' ? true : false,
});

export const db = drizzle(pool);

(async () => {
	await db.execute(sql`select now();`);
})();
console.log('database connection was established successfully.');
