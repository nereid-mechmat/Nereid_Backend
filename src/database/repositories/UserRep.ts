import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { users } from '../schemas/users.ts';

class UserRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getUserById = async (userId: number) => {
		const result = await this.db
			.select()
			.from(users)
			.where(eq(users.id, userId));

		return result[0];
	};

	getUserByEmail = async (email: string) => {
		const result = await this.db
			.select()
			.from(users)
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
