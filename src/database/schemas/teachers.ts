import { boolean, integer, pgTable } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const teachers = pgTable('teachers', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer().notNull().references(() => users.id),
	isActive: boolean().default(true),
});
