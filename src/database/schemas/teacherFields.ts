import { index, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { teachers } from './teachers.ts';

export const teacherFields = pgTable('teacher_fields', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	teacherId: integer().references(() => teachers.id),
	name: varchar({ length: 255 }),
	content: text(),
}, (table) => ({
	teacherFieldsTeacherIdIdx: index().on(table.teacherId),
}));
