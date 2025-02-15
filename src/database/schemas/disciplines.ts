import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const disciplines = pgTable('disciplines', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
});
