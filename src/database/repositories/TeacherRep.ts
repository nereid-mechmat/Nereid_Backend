import type { SQL } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { teachers } from '../schemas/teachers.ts';
import { users } from '../schemas/users.ts';

const filtersMap = {
	email: users.email,
	firstName: users.firstName,
	lastName: users.lastName,
	patronymic: users.patronymic,
	isActive: teachers.isActive,
};

export class TeacherRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getTeacherById = async (teacherId: number) => {
		const teacher = await this.db
			.select({
				id: teachers.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				isActive: teachers.isActive,
			})
			.from(teachers)
			.innerJoin(users, eq(teachers.userId, users.id))
			.where(eq(teachers.id, teacherId))
			.then((rows) => rows[0]);

		return teacher;
	};

	getAllTeachers = async (filters?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		isActive?: boolean;
	}) => {
		const query = this.db
			.select({
				id: teachers.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				isActive: teachers.isActive,
			})
			.from(teachers)
			.innerJoin(users, eq(teachers.userId, users.id));

		const eqList: SQL<unknown>[] = [];
		for (const [filterName, filterValue] of Object.entries(filters ?? {})) {
			const drizzleColumn = filtersMap[filterName as keyof typeof filtersMap];
			if (drizzleColumn !== undefined && filterValue !== undefined) {
				eqList.push(eq(drizzleColumn, filterValue));
			}
		}

		if (eqList.length !== 0) {
			return await query.where(and(...eqList));
		}

		return await query;
	};

	addTeacher = async (teacher: {
		email: string;
		firstName: string;
		lastName: string;
		patronymic: string;
		password: string;
	}) => {
		const { userId } = await this.db
			.insert(users)
			.values({
				email: teacher.email,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				patronymic: teacher.patronymic,
				password: teacher.password,
			})
			.returning({ userId: users.id })
			.then((rows) => rows[0]!);

		await this.db
			.insert(teachers)
			.values(
				{
					userId,
				},
			);
	};

	changeTeacherById = async (teacherId: number, teacher: {
		isActive?: boolean;
	}) => {
		await this.db
			.update(teachers)
			.set({
				isActive: teacher.isActive,
			})
			.where(eq(teachers.id, teacherId));
	};
}

export default new TeacherRep();
