import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { roles } from './roles.ts';

export const admins = pgTable('admins', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	roleId: integer().references(() => roles.id),
	password: varchar({ length: 255 }).notNull(),
});
