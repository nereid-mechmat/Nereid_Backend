import { reset, seed } from 'drizzle-seed';
import { db } from './databaseConnection.ts';
import { admins } from './schemas/admins.ts';
import { disciplineFields } from './schemas/disciplineFields.ts';
import { disciplines } from './schemas/disciplines.ts';
import { roles } from './schemas/roles.ts';
import { students } from './schemas/students.ts';
import { teacherDiscipleRelations } from './schemas/teacherDisciplineRelations.ts';
import { teachers } from './schemas/teachers.ts';
import { users } from './schemas/users.ts';

const schema = {
	admins,
	disciplineFields,
	disciplines,
	roles,
	students,
	teacherDiscipleRelations,
	teachers,
	users,
};

// TODO: make it work
const main = async () => {
	await reset(db, schema);
	await seed(db, schema).refine((funcs) => ({
		roles: {
			count: 3,
			columns: {
				id: funcs.default({ defaultValue: null }),
				name: funcs.valuesFromArray({ values: ['admin', 'teacher', 'student'] }),
			},
		},
	}));
};

main();
