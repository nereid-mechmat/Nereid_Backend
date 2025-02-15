import { integer, pgTable } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const admins = pgTable('admins', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer().notNull().references(() => users.id),
});
