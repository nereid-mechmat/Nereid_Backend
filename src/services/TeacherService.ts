import userRep from '~/database/repositories/UserRep.ts';
import teacherRep from '../database/repositories/TeacherRep.ts';

export class TeacherService {
	getTeacherByUserId = async (userId: number) => {
		const teacher = await teacherRep.getTeacherByUserId(userId);
		if (teacher === undefined) {
			return { teacherExists: false };
		}
		return {
			teacherExists: true,
			teacher,
		};
	};

	editTeacherById = async (teacher: {
		id: number;
		userId: number;
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

		if (currTeacher.userId !== teacher.userId) {
			return { isOwner: false };
		}

		if (currTeacher.isActive === false) {
			return { isActive: false };
		}

		if (
			teacher.email !== undefined
			|| teacher.firstName !== undefined
			|| teacher.lastName !== undefined
			|| teacher.patronymic !== undefined
		) {
			await userRep.editUserById(teacher.userId, {
				email: teacher.email,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				patronymic: teacher.patronymic,
			});
		}

		if (
			teacher.isActive !== undefined
		) {
			await teacherRep.editTeacherById(currTeacher.id, {
				isActive: teacher.isActive,
			});
		}

		return {
			teacherExists: true,
			isOwner: true,
			isActive: true,
		};
	};

	addFieldToTeacher = async (
		teacher: {
			id: number;
			userId: number;
		},
		field: {
			name: string;
			content: string;
		},
	) => {
		const currTeacher = await teacherRep.getTeacherById(teacher.id);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (currTeacher.userId !== teacher.userId) {
			return { isOwner: false };
		}

		if (currTeacher.isActive === false) {
			return { isActive: false };
		}

		await teacherRep.addFieldToTeacher(teacher.id, field);
		return {
			teacherExists: true,
			isOwner: true,
			isActive: true,
		};
	};

	deleteFieldFromTeacher = async (fieldId: number) => {
		await teacherRep.deleteFieldFromTeacher(fieldId);
	};
}

export default new TeacherService();
