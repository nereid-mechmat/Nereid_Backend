import studentDisciplineRelationRep from '~/database/repositories/studentDisciplineRelationRep.ts';
import teacherRep from '~/database/repositories/TeacherRep.ts';
import disciplineRep from '../database/repositories/DisciplineRep.ts';
import studentRep from '../database/repositories/StudentRep.ts';

export class StudentService {
	getStudentByUserId = async (userId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		return {
			studentExists: true,
			student,
		};
	};

	getAllDisciplines = async (userId: number, semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { invalidSemester: true };
		}

		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		const disciplines = await disciplineRep.getAllDisciplinesBySemester(semester);

		return {
			invalidSemester: false,
			studentExists: true,
			studentIsActive: true,
			disciplines,
			minimumCredits: semester === '1' ? student.semester1MinCredits : student.semester2MinCredits,
			maximumCredits: semester === '1' ? student.semester1MaxCredits : student.semester2MaxCredits,
			currentCredits: semester === '1' ? student.semester1Credits : student.semester2Credits,
		};
	};

	getAllSelectedDisciplines = async (userId: number, semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { selectedDisciplines: [], invalidSemester: true };
		}

		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { selectedDisciplines: [], studentExists: false };
		}

		if (student.isActive === false) {
			return { selectedDisciplines: [], studentIsActive: false };
		}

		const selectedDisciplines = await disciplineRep.getAllSelectedDisciplinesForStudent({
			semester,
			studentId: student.id,
		});

		return {
			studentExists: true,
			studentIsActive: true,
			invalidSemester: false,
			selectedDisciplines,
			minimumCredits: semester === '1' ? student.semester1MinCredits : student.semester2MinCredits,
			maximumCredits: semester === '1' ? student.semester1MaxCredits : student.semester2MaxCredits,
			currentCredits: semester === '1' ? student.semester1Credits : student.semester2Credits,
		};
	};

	getDisciplineById = async (userId: number, disciplineId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

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
			studentExists: true,
			disciplineExists: true,
			studentIsActive: true,
			discipline,
			disciplineFields,
			disciplineTeachers,
		};
	};

	getTeacherById = async (userId: number, teacherId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		const teacher = await teacherRep.getFullTeacherById(teacherId);
		if (teacher === undefined) {
			return { teacherExists: false };
		}

		const teacherFields = await teacherRep.getAllTeacherFields(teacherId);

		return {
			studentExists: true,
			studentIsActive: true,
			teacherExists: true,
			teacher,
			teacherFields,
		};
	};

	selectDiscipline = async (userId: number, disciplineId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		if (student.canSelect === false) {
			return { studentCanSelect: false };
		}

		const discipline = await disciplineRep.getDisciplineById(disciplineId);
		if (discipline === undefined) {
			return { disciplineExists: false };
		}

		const studentMaxCredits = discipline.semester === '1' ? student.semester1MaxCredits : student.semester2MaxCredits;
		const studentCurrentCredits = discipline.semester === '1' ? student.semester1Credits : student.semester2Credits;
		if (
			studentCurrentCredits + discipline.credits > studentMaxCredits
		) {
			return { exceededCreditsMax: true };
		}

		await studentDisciplineRelationRep.addDisciplineToStudent(student.id, disciplineId);

		discipline.semester === '1'
			? await studentRep.editStudentById(student.id, { semester1Credits: studentCurrentCredits + discipline.credits })
			// discipline.semester === '2'
			: await studentRep.editStudentById(student.id, { semester2Credits: studentCurrentCredits + discipline.credits });

		return {
			studentExists: true,
			studentIsActive: true,
			studentCanSelect: true,
			disciplineExists: true,
			exceededCreditsMax: false,
			currentCredits: studentCurrentCredits + discipline.credits,
		};
	};

	deselectDiscipline = async (userId: number, disciplineId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		if (student.canSelect === false) {
			return { studentCanSelect: false };
		}

		const discipline = await disciplineRep.getDisciplineById(disciplineId);
		if (discipline === undefined) {
			return { disciplineExists: false };
		}

		const studentCurrentCredits = discipline.semester === '1' ? student.semester1Credits : student.semester2Credits;

		await studentDisciplineRelationRep.deleteDisciplineFromStudent(student.id, disciplineId);

		discipline.semester === '1'
			? await studentRep.editStudentById(student.id, { semester1Credits: studentCurrentCredits - discipline.credits })
			// discipline.semester === '2'
			: await studentRep.editStudentById(student.id, { semester2Credits: studentCurrentCredits - discipline.credits });

		return {
			studentExists: true,
			studentIsActive: true,
			studentCanSelect: true,
			disciplineExists: true,
			currentCredits: studentCurrentCredits - discipline.credits,
		};
	};
}
export default new StudentService();
