import { Parser } from '@json2csv/plainjs';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import disciplineRep from '~/database/repositories/DisciplineRep.ts';
import roleRep from '~/database/repositories/RoleRep.ts';
import studentDisciplineRelationRep from '~/database/repositories/studentDisciplineRelationRep.ts';
import teacherDisciplineRelationRep from '~/database/repositories/teacherDisciplineRelationRep.ts';
import userRep from '~/database/repositories/UserRep.ts';
import studentRep from '../database/repositories/StudentRep.ts';
import teacherRep from '../database/repositories/TeacherRep.ts';

export class AdminService {
	getAdminByUserId = async (userId: number) => {
		const user = await userRep.getUserById(userId);
		if (user === undefined) {
			return { userExists: false };
		}

		return {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			patronymic: user.patronymic,
		};
	};

	editAdminByUserId = async (userId: number, admin: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
	}) => {
		await userRep.editUserById(userId, admin);
	};

	getAllStudents = async (filters?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		educationalProgram?: string;
		course?: string;
		year?: string;
		isActive?: boolean;
	}) => {
		const students = await studentRep.getAllStudents(filters);
		return students;
	};

	addStudent = async (student: {
		email: string;
		firstName: string;
		lastName: string;
		patronymic: string;
		educationalProgram: string;
		course: string;
		year: string;
	}) => {
		const saltRounds = Number(process.env['SALT_ROUNDS']);

		const randomPassword = randomBytes(20).toString('hex');
		const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

		const { id: roleId } = (await roleRep.getRoleByName('student'))!;
		const { id: userId } = await userRep.addUser({
			email: student.email,
			firstName: student.firstName,
			lastName: student.lastName,
			patronymic: student.patronymic,
			password: hashedPassword,
			roleId,
		});

		await studentRep.addStudent({
			userId,
			...student,
		});
	};

	editStudent = async (student: {
		id: number;
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		educationalProgram?: string;
		course?: string;
		year?: string;
		isActive?: boolean;
		canSelect?: boolean;
		semester1MinCredits?: number;
		semester1MaxCredits?: number;
		semester1Credits?: number;
		semester2MinCredits?: number;
		semester2MaxCredits?: number;
		semester2Credits?: number;
	}) => {
		const currStudent = await studentRep.getStudentById(student.id);
		if (currStudent === undefined) {
			return { studentExists: false };
		}

		if (
			student.email !== undefined
			|| student.firstName !== undefined
			|| student.lastName !== undefined
			|| student.patronymic !== undefined
		) {
			await userRep.editUserById(currStudent.userId, {
				email: student.email,
				firstName: student.firstName,
				lastName: student.lastName,
				patronymic: student.patronymic,
			});
		}

		await studentRep.editStudentById(currStudent.id, {
			educationalProgram: student.educationalProgram,
			course: student.course,
			year: student.year,
			isActive: student.isActive,
			canSelect: student.canSelect,
			semester1MinCredits: student.semester1MinCredits,
			semester1MaxCredits: student.semester1MaxCredits,
			semester1Credits: student.semester1Credits,
			semester2MinCredits: student.semester2MinCredits,
			semester2MaxCredits: student.semester2MaxCredits,
			semester2Credits: student.semester2Credits,
		});
		return {
			studentExists: true,
		};
	};

	getAllTeachers = async (filters?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		isActive?: boolean;
	}) => {
		const teachers = await teacherRep.getAllTeachers(filters);
		return teachers;
	};

	addTeacher = async (teacher: {
		email: string;
		firstName: string;
		lastName: string;
		patronymic: string;
	}) => {
		const saltRounds = Number(process.env['SALT_ROUNDS']);

		const randomPassword = randomBytes(20).toString('hex');
		const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

		const { id: roleId } = (await roleRep.getRoleByName('teacher'))!;
		const { id: userId } = await userRep.addUser({
			email: teacher.email,
			firstName: teacher.firstName,
			lastName: teacher.lastName,
			patronymic: teacher.patronymic,
			password: hashedPassword,
			roleId,
		});

		await teacherRep.addTeacher({
			userId,
		});
	};

	editTeacher = async (teacher: {
		id: number;
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		isActive?: boolean;
	}) => {
		const currTeacher = await teacherRep.getTeacherById(teacher.id);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (
			teacher.email !== undefined
			|| teacher.firstName !== undefined
			|| teacher.lastName !== undefined
			|| teacher.patronymic !== undefined
		) {
			await userRep.editUserById(currTeacher.userId, {
				email: teacher.email,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				patronymic: teacher.patronymic,
			});
		}

		await teacherRep.editTeacherById(currTeacher.id, {
			isActive: teacher.isActive,
		});
		return {
			teacherExists: true,
		};
	};

	getAllDisciplines = async () => {
		const allDisciplines = await disciplineRep.getAllDisciplines();
		return allDisciplines;
	};

	getDisciplineById = async (disciplineId: number) => {
		const discipline = await disciplineRep.getDisciplineById(disciplineId);
		if (discipline === undefined) {
			return { disciplineExists: false };
		}

		const disciplineFieldsPromise = disciplineRep.getAllDisciplineFields(disciplineId);
		const disciplineTeachersPromise = disciplineRep.getAllDisciplineTeachers(disciplineId);
		const [disciplineFields, disciplineTeachers] = await Promise.all([
			disciplineFieldsPromise,
			disciplineTeachersPromise,
		]);

		return {
			disciplineExists: true,
			discipline,
			disciplineFields,
			disciplineTeachers,
		};
	};

	addDiscipline = async (discipline: { name: string; semester: '1' | '2'; credits: number }) => {
		if (!['1', '2'].includes(discipline.semester)) {
			return { invalidSemester: true };
		}

		await disciplineRep.addDiscipline(discipline);
		return { invalidSemester: false };
	};

	deleteDiscipline = async (disciplineId: number) => {
		await disciplineRep.deleteDiscipline(disciplineId);
	};

	releaseTeacherFromDiscipline = async (teacherId: number, disciplineId: number) => {
		await teacherDisciplineRelationRep.deleteTeacherFromDiscipline(teacherId, disciplineId);
	};

	lockDisciplineSelection = async () => {
		await studentRep.editStudentBy({ isActive: true }, { canSelect: false });
	};

	unlockDisciplineSelection = async () => {
		await studentRep.editStudentBy({ isActive: true, canSelect: false }, { canSelect: true });
	};

	getStudentsForAllDisciplines = async (semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { invalidSemester: true };
		}

		const semesterDisciplines = await disciplineRep.getAllDisciplinesBySemester(semester);
		const promises: ReturnType<typeof studentDisciplineRelationRep.getStudentsByDiscipline>[] = [];

		for (const discipline of semesterDisciplines) {
			promises.push(studentDisciplineRelationRep.getStudentsByDiscipline(discipline.id));
		}

		const resolvedPromises = await Promise.all(promises);
		const studentsForAllDisciplines = resolvedPromises.map((studentList, idx) => ({
			disciplineName: semesterDisciplines[idx]!.name,
			disciplineSemester: semesterDisciplines[idx]!.semester,
			students: studentList,
		}));

		const parser = new Parser({ includeEmptyRows: true });

		let csv: string = '';
		for (const disciplineStudents of studentsForAllDisciplines) {
			csv += `${disciplineStudents.disciplineName},semester:${disciplineStudents.disciplineSemester}\n`;
			csv += parser.parse(disciplineStudents.students);

			// const studentKeysCount = Object.keys(disciplineStudents.students[0]! ?? {}).length;
			// const comasCount = studentKeysCount === 0 ? studentKeysCount : studentKeysCount - 1;
			// csv += '\n' + `,`.repeat(comasCount) + '\n';
			csv += '\n\n';
		}

		return {
			invalidSemester: false,
			csv,
		};
	};
}

export default new AdminService();
