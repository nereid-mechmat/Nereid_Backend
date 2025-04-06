import { index, integer, pgTable } from 'drizzle-orm/pg-core';
import { disciplines } from './disciplines.ts';
import { students } from './students.ts';

export const studentDiscipleRelations = pgTable('student_discipline_relations', {
	studentId: integer().references(() => students.id),
	disciplineId: integer().references(() => disciplines.id),
}, (table) => ({
	studentDiscipleRelationsStudentIdIdx: index().on(table.studentId),
	studentDiscipleRelationsDisciplineIdIdx: index().on(table.disciplineId),
}));
