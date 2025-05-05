import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { disciplines } from '../schemas/disciplines.ts';
import { studentDiscipleRelations } from '../schemas/studentDisciplineRelations.ts';
import { students } from '../schemas/students.ts';
import { users } from '../schemas/users.ts';

export class StudentDisciplineRelationRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getAllRelations = async () => {
		const relations = await this.db
			.select()
			.from(studentDiscipleRelations);

		return relations;
	};

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

	getStudentsByDiscipline = async (disciplineId: number) => {
		const disciplineStudents = await this.db
			.select({
				id: students.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				educationalProgram: students.educationalProgram,
				course: students.course,
				year: students.year,
			})
			.from(studentDiscipleRelations)
			.innerJoin(students, eq(studentDiscipleRelations.studentId, students.id))
			.innerJoin(users, eq(students.userId, users.id))
			.where(eq(studentDiscipleRelations.disciplineId, disciplineId));

		return disciplineStudents;
	};

	getDisciplinesByStudent = async (studentId: number, semester: '1' | '2') => {
		const studentDisciplines = await this.db
			.select({
				// id: disciplines.id,
				name: disciplines.name,
				credits: disciplines.credits,
			})
			.from(studentDiscipleRelations)
			.innerJoin(students, eq(studentDiscipleRelations.studentId, students.id))
			.innerJoin(disciplines, eq(studentDiscipleRelations.disciplineId, disciplines.id))
			.where(and(
				eq(studentDiscipleRelations.studentId, studentId),
				eq(disciplines.semester, semester),
			));

		return studentDisciplines;
	};
}

export default new StudentDisciplineRelationRep();
