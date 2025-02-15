import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { roles } from '../schemas/roles.ts';
import { users } from '../schemas/users.ts';

class UserRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getAllRoles = async () => {
		const result = await this.db
			.select()
			.from(roles);

		return result;
	};

	deleteAllRoles = async () => {
		await this.db.delete(roles);
	};

	addRoles = async (rolesToAdd: (typeof roles.$inferInsert)[]) => {
		await this.db.insert(roles).values(rolesToAdd);
	};

	getUserById = async (userId: number) => {
		const result = await this.db
			.select()
			.from(users)
			.where(eq(users.id, userId));

		return result[0];
	};

	getUserByEmail = async (email: string) => {
		const result = await this.db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				password: users.password,
				otp: users.otp,
				otpExpiredTimestamp: users.otpExpiredTimestamp,
				roleId: users.roleId,
				roleName: roles.name,
			})
			.from(users)
			.innerJoin(roles, eq(users.roleId, roles.id))
			.where(eq(users.email, email));

		return result[0];
	};

	changeUserById = async (userId: number, user: Partial<typeof users.$inferInsert>) => {
		const result = await this.db
			.update(users)
			.set(user)
			.where(eq(users.id, userId))
			.returning();

		return result[0];
	};
}

export default new UserRep();
