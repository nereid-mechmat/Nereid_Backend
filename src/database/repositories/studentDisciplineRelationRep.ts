import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { studentDiscipleRelations } from '../schemas/studentDisciplineRelations.ts';

export class StudentDisciplineRelationRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	addDisciplineToStudent = async (studentId: number, disciplineId: number) => {
		const result = await this.db
			.select()
			.from(studentDiscipleRelations)
			.where(
				and(
					eq(studentDiscipleRelations.studentId, studentId),
					eq(studentDiscipleRelations.disciplineId, disciplineId),
				),
			)
			.then((rows) => rows[0]);

		if (result !== undefined) return;

		await this.db.insert(studentDiscipleRelations).values({ studentId, disciplineId });
	};

	deleteDisciplineFromStudent = async (studentId: number, disciplineId: number) => {
		await this.db
			.delete(studentDiscipleRelations)
			.where(
				and(
					eq(studentDiscipleRelations.studentId, studentId),
					eq(studentDiscipleRelations.disciplineId, disciplineId),
				),
			);
	};
}

export default new StudentDisciplineRelationRep();
