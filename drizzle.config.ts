import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD, SSL } = process.env;

export default defineConfig({
	out: './drizzle',
	schema: './src/database/schemas',
	dialect: 'postgresql',
	dbCredentials: {
		host: PG_HOST!,
		port: Number(PG_PORT) || 5432,
		database: PG_DATABASE!,
		user: PG_USER!,
		password: PG_PASSWORD,
		ssl: SSL === 'true' ? true : false,
	},
});
