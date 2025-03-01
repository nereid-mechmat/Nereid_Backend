import type { Context } from 'hono';

export class TeacherController {
	getTeacherByUserId = async (c: Context) => {
		const userId = Number(c.req.param('id'));
		const teacher = await teacherService.getTeacherByUserId(userId);
		return c.json(teacher, 200);
	};
}

export default new TeacherController();
