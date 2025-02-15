import type { SQL } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { students } from '../schemas/students.ts';
import { users } from '../schemas/users.ts';

const filtersMap = {
	email: users.email,
	firstName: users.firstName,
	lastName: users.lastName,
	patronymic: users.patronymic,
	group: students.group,
	year: students.year,
	isActive: students.isActive,
};

export class StudentRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getStudentById = async (studentId: number) => {
		const student = await this.db
			.select({
				id: students.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				group: students.group,
				year: students.year,
				isActive: students.isActive,
			})
			.from(students)
			.innerJoin(users, eq(students.userId, users.id))
			.where(eq(students.id, studentId))
			.then((rows) => rows[0]);

		return student;
	};

	getAllStudents = async (filters?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		group?: string;
		year?: string;
		isActive?: boolean;
	}) => {
		const query = this.db
			.select({
				id: students.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				group: students.group,
				year: students.year,
				isActive: students.isActive,
			})
			.from(students)
			.innerJoin(users, eq(students.userId, users.id));

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

	addStudent = async (student: {
		email: string;
		firstName: string;
		lastName: string;
		patronymic: string;
		group: string;
		year: string;
		password: string;
	}) => {
		const { userId } = await this.db
			.insert(users)
			.values({
				email: student.email,
				firstName: student.firstName,
				lastName: student.lastName,
				patronymic: student.patronymic,
				password: student.password,
			})
			.returning({ userId: users.id })
			.then((rows) => rows[0]!);

		await this.db
			.insert(students)
			.values(
				{
					userId,
					group: student.group,
					year: student.year,
				},
			);
	};

	changeStudentById = async (studentId: number, student: {
		group?: string;
		year?: string;
		isActive?: boolean;
		canSelect?: boolean;
	}) => {
		await this.db
			.update(students)
			.set(student)
			.where(eq(students.id, studentId));
	};
}

export default new StudentRep();
