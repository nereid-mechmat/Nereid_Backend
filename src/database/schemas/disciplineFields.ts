import { index, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { disciplines } from './disciplines.ts';

export const disciplineFields = pgTable('discipline_fields', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	disciplineId: integer().references(() => disciplines.id),
	name: varchar({ length: 255 }),
	content: text(),
}, (table) => ({
	disciplineFieldsDisciplineIdIdx: index().on(table.disciplineId),
}));
