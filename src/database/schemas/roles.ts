import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
	id: integer().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
});
