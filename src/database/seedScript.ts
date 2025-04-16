import bcrypt from 'bcrypt';
import { gt } from 'drizzle-orm';
import { reset, seed } from 'drizzle-seed';
import { db } from './databaseConnection.ts';
import { disciplineFields } from './schemas/disciplineFields.ts';
import { disciplines } from './schemas/disciplines.ts';
import { roles } from './schemas/roles.ts';
import { studentDiscipleRelations } from './schemas/studentDisciplineRelations.ts';
import { students } from './schemas/students.ts';
import { teacherDiscipleRelations } from './schemas/teacherDisciplineRelations.ts';
import { teachers } from './schemas/teachers.ts';
import { users } from './schemas/users.ts';

const schema = {
	disciplineFields,
	disciplines,
	roles,
	students,
	teacherDiscipleRelations,
	teachers,
	users,
};

const schema4students = {
	users,
	students,
	disciplines,
	studentDiscipleRelations,
};

const disciplineNames = [
	'Deeplearning',
	'High performance computing',
	'cryptographic protocols',
	'методика викладання',
	'педагогіка',
	'психологія',
	'шаблони проєктування пз',
	'динамічні системи',
	'методи обчислень',
	'алгебраїчна геометрія',
	'проф. та корп. етика',
	'computer statistic',
	'soft computing',
	'computability theory',
	'мо захисту информації',
	'математика фінансів',
	'англійська мова',
	'теорія наближень',
	'машинний зір',
	'постквантова криптографія',
	'автомати та мови',
	'управління проектами',
	'соціально-політичні студії',
	'аналіз великих даних',
	'англійська мова',
	'Вибрані розділи трудового права і основ підприємницької діяльності',
	'Методи оптимізації',
	'Функціональний аналіз',
	'High-Dimensional Probability for Data Science',
	'Математична фізика',
	'Аналітика в продуктовому ІТ',
	'Бази даних',
	'Риторика',
	'Розробка програмних продуктів',
	'Функціональне програмування',
	'Штучні нейронні мережі',
	'Економіка',
	'Математичні методи в економіці',
	'Прикладне програмування',
	'МатКрипто',
	'ТеорСкл',
	'КомплАн',
	'ML',
	'НОС',
	'екологія',
];

const saltRounds = Number(process.env['SALT_ROUNDS']);
const hashedPassword = bcrypt.hashSync('123', saltRounds);

const insertRoles = async () => {
	await db.insert(roles).values([
		{ id: 0, name: 'admin' },
		{ id: 1, name: 'teacher' },
		{ id: 2, name: 'student' },
	]);
};

const insertEscentialUsers = async () => {
	await db.insert(users).overridingSystemValue().values([{
		id: -1,
		firstName: 'adminFirstName',
		lastName: 'adminLastName',
		patronymic: 'adminPatronymic',
		email: 'admin@gmail.com',
		roleId: 0,
		password: hashedPassword,
	}, {
		id: -2,
		firstName: 'teacherFirstName',
		lastName: 'teacherLastName',
		patronymic: 'teacherPatronymic',
		email: 'teacher@gmail.com',
		roleId: 1,
		password: hashedPassword,
	}, {
		id: -3,
		firstName: 'studentFirstName',
		lastName: 'studentLastName',
		patronymic: 'studentPatronymic',
		email: 'student@gmail.com',
		roleId: 2,
		password: hashedPassword,
	}, {
		id: -4,
		firstName: 'tima',
		lastName: 't',
		patronymic: 'a',
		email: 'tantisch03@gmail.com',
		roleId: 2,
		password: hashedPassword,
	}]);
};

const insertEscentialStudents = async () => {
	await db.insert(students).overridingSystemValue().values([{
		id: -1,
		userId: -3,
		course: '6',
		year: '2019',
		educationalProgram: 'comp mat',
		semester1MaxCredits: 30,
		semester2MaxCredits: 30,
		canSelect: true,
		isActive: true,
	}, {
		id: -2,
		userId: -4,
		course: '6',
		year: '2019',
		educationalProgram: 'comp mat',
		semester1MaxCredits: 30,
		semester2MaxCredits: 30,
		canSelect: true,
		isActive: true,
	}]);
};

const insertEscentialTeachers = async () => {
	await db.insert(teachers).overridingSystemValue().values([{
		id: -1,
		userId: -2,
		isActive: true,
	}]);
};

export const fastCartesianProduct = (sets: (number | string | boolean | object)[][], index: number) => {
	const resultList = [];
	let currSet: (typeof sets)[number];
	let element: (typeof sets)[number][number];

	for (let i = sets.length - 1; i >= 0; i--) {
		currSet = sets[i]!;
		element = currSet[index % currSet.length]!;
		resultList.unshift(element);
		index = Math.floor(index / currSet.length);
	}

	return resultList;
};

// TODO: make it work
const main = async () => {
	const studentsCount = 200;
	const studentDiscipleRelationsCount = 2000;
	const teachersCount = 45;
	const teacherDiscipleRelationsCount = 50;

	await reset(db, schema);

	await insertRoles();
	await insertEscentialUsers();
	await insertEscentialStudents();
	await insertEscentialTeachers();

	await seed(db, schema4students).refine((funcs) => ({
		users: {
			count: studentsCount + teachersCount,
			columns: {
				// ignore column
				id: funcs.intPrimaryKey(),
				roleId: funcs.default({ defaultValue: 2 }),
				otp: funcs.default({ defaultValue: null }),
				otpExpiredTimestamp: funcs.default({ defaultValue: null }),
				patronymic: funcs.firstName(),
				password: funcs.default({ defaultValue: hashedPassword }),
			},
		},
		students: {
			count: studentsCount,
			columns: {
				// ignore column
				// id: funcs.default({ defaultValue: undefined }),
				course: funcs.valuesFromArray({ values: ['1', '2', '3', '4', '5', '6'] }),
				educationalProgram: funcs.valuesFromArray({
					values: ["комп'ютерна математика", 'статистика', "комп'ютерна механіка", 'середня освіта'],
				}),
				year: funcs.valuesFromArray({ values: ['2019', '2020', '2021', '2022', '2023', '2024'] }),
				// ignore column
				isActive: funcs.default({ defaultValue: true }),
				// ignore column
				canSelect: funcs.default({ defaultValue: true }),
				// ignore column
				semester1Credits: funcs.default({ defaultValue: undefined }),
				// ignore column
				semester1MinCredits: funcs.default({ defaultValue: undefined }),
				semester1MaxCredits: funcs.default({ defaultValue: 30 }),
				// ignore column
				semester2Credits: funcs.default({ defaultValue: undefined }),
				// ignore column
				semester2MinCredits: funcs.default({ defaultValue: undefined }),
				semester2MaxCredits: funcs.default({ defaultValue: 30 }),
			},
		},
		disciplines: {
			count: disciplineNames.length,
			columns: {
				// ignore column
				// id: funcs.default({ defaultValue: undefined }),
				name: funcs.valuesFromArray({ values: disciplineNames, isUnique: true }),
				semester: funcs.valuesFromArray({ values: ['1', '2'] }),
				credits: funcs.valuesFromArray({ values: [1, 2, 3, 4] }),
				description: funcs.loremIpsum(),
			},
		},
		studentDiscipleRelations: {
			count: studentDiscipleRelationsCount,
		},
	}));

	await db.update(users).set({ roleId: 1 }).where(gt(users.id, studentsCount));

	const teacherUsersIds = await db.select({ userId: users.id }).from(users).where(gt(users.id, studentsCount));
	await db.insert(teachers).values(teacherUsersIds);
	const disciplineIds = await db.select({ disciplineId: disciplines.id }).from(disciplines);
	const teacherIds = await db.select({ teacherId: teachers.id }).from(teachers);

	const teacherDiscipleRelationsL = [];
	for (let i = 0; i < teacherDiscipleRelationsCount; i++) {
		const [teacherObj, disciplineObj] = fastCartesianProduct([teacherIds, disciplineIds], i) as [
			{ teacherId: number },
			{ disciplineId: number },
		];
		teacherDiscipleRelationsL.push({ ...teacherObj, ...disciplineObj });
	}
	await db.insert(teacherDiscipleRelations).values(teacherDiscipleRelationsL);

	// await reset(db, { disciplines });

	// await seed(db, schema4teachers).refine((funcs) => ({
	// 	users: {
	// 		skipN: studentsCount,
	// 		count: studentsCount + teachersCount,
	// 		columns: {
	// 			id: funcs.intPrimaryKey(),
	// 			roleId: funcs.default({ defaultValue: 1 }),
	// 			otp: funcs.default({ defaultValue: null }),
	// 			otpExpiredTimestamp: funcs.default({ defaultValue: null }),
	// 			patronymic: funcs.firstName(),
	// 			password: funcs.default({ defaultValue: hashedPassword }),
	// 		},
	// 	},
	// 	teachers: {
	// 		count: teachersCount,
	// 	},
	// 	disciplines: {
	// 		count: disciplineNames.length,
	// 		columns: {
	// 			// ignore column
	// 			// id: funcs.default({ defaultValue: undefined }),
	// 			name: funcs.valuesFromArray({ values: disciplineNames, isUnique: true }),
	// 			semester: funcs.valuesFromArray({ values: ['1', '2'] }),
	// 			credits: funcs.valuesFromArray({ values: [1, 2, 3, 4] }),
	// 			description: funcs.loremIpsum(),
	// 		},
	// 	},
	// 	teacherDiscipleRelations: {
	// 		count: teacherDiscipleRelationsCount,
	// 	},
	// }));
};

main();
