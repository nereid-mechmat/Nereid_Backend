import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { disciplineFields } from '../schemas/disciplineFields.ts';
import { disciplines } from '../schemas/disciplines.ts';
import { teacherDiscipleRelations } from '../schemas/teacherDisciplineRelations.ts';
import { teachers } from '../schemas/teachers.ts';
import { users } from '../schemas/users.ts';

export class DisciplineRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getAllDisciplines = async () => {
		const allDisciplines = await this.db.select().from(disciplines);
		return allDisciplines;
	};

	getDisciplineById = async (disciplineId: number) => {
		const discipline = await this.db
			.select()
			.from(disciplines)
			.where(eq(disciplines.id, disciplineId))
			.then((rows) => rows[0]);

		return discipline;
	};

	getAllDisciplineFields = async (disciplineId: number) => {
		const allDisciplineFields = await this.db
			.select({
				id: disciplineFields.id,
				name: disciplineFields.name,
				content: disciplineFields.content,
			})
			.from(disciplines)
			.innerJoin(disciplineFields, eq(disciplines.id, disciplineFields.disciplineId))
			.where(eq(disciplines.id, disciplineId));

		return allDisciplineFields;
	};

	getAllDisciplineTeachers = async (disciplineId: number) => {
		const allDisciplineTeachers = await this.db
			.select({
				id: teachers.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
			})
			.from(disciplines)
			.innerJoin(teacherDiscipleRelations, eq(disciplines.id, teacherDiscipleRelations.disciplineId))
			.innerJoin(teachers, eq(teacherDiscipleRelations.teacherId, teachers.id))
			.innerJoin(users, eq(teachers.userId, users.id))
			.where(eq(disciplines.id, disciplineId));

		return allDisciplineTeachers;
	};

	addDiscipline = async (disciplineName: string) => {
		await this.db.insert(disciplines).values({ name: disciplineName });
	};

	deleteDiscipline = async (disciplineId: number) => {
		await this.db
			.delete(disciplineFields)
			.where(
				eq(disciplineFields.disciplineId, disciplineId),
			);

		await this.db
			.delete(disciplines)
			.where(
				eq(disciplines.id, disciplineId),
			);
	};
}

export default new DisciplineRep();
