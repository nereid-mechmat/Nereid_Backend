import type { Context } from 'hono';
import { Hono } from 'hono';
import studentController from '../controllers/StudentController.ts';
import { authenticate, studentValidation } from '../middlewares/Authentication.ts';

export const studentRouter = new Hono();

studentRouter.get('/healthy', (c: Context) => {
	return c.text('healthy', 200);
});

studentRouter.get('/get', authenticate, studentValidation, studentController.getStudentByUserId);
studentRouter.get('/get-all-disciplines', authenticate, studentValidation, studentController.getAllDisciplines);
studentRouter.get(
	'/get-all-selected-disciplines',
	authenticate,
	studentValidation,
	studentController.getAllSelectedDisciplines,
);

studentRouter.get(
	'/get-discipline/:id',
	authenticate,
	studentValidation,
	studentController.getDisciplineById,
);

studentRouter.get(
	'/get-teacher/:id',
	authenticate,
	studentValidation,
	studentController.getTeacherById,
);

studentRouter.patch('/select-discipline', authenticate, studentValidation, studentController.selectDiscipline);
studentRouter.patch('/deselect-discipline', authenticate, studentValidation, studentController.deselectDiscipline);
