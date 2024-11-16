import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const students = pgTable('students', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer().notNull().references(() => users.id),
	year: varchar({ length: 255 }).notNull(),
	group: varchar({ length: 255 }).notNull(),
	isActive: boolean(),
	canSelect: boolean(),
});
