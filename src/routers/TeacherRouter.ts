import type { Context } from 'hono';
import { Hono } from 'hono';
import teacherController from '../controllers/TeacherController.ts';
import { authenticate, teacherValidation } from '../middlewares/Authentication.ts';

export const teacherRouter = new Hono();

teacherRouter.get('/healthy', (c: Context) => {
	return c.text('healthy', 200);
});

teacherRouter.get('/get', authenticate, teacherValidation, teacherController.getTeacherByUserId);
teacherRouter.patch('/edit', authenticate, teacherValidation, teacherController.editTeacherById);
teacherRouter.post('/add-field', authenticate, teacherValidation, teacherController.addFieldToTeacher);
teacherRouter.delete('/delete-field/:id', authenticate, teacherValidation, teacherController.deleteFieldFromTeacher);

teacherRouter.get('/get-all-disciplines', authenticate, teacherValidation, teacherController.getAllDisciplines);
teacherRouter.patch('/take-discipline', authenticate, teacherValidation, teacherController.takeDiscipline);
teacherRouter.patch('/release-discipline', authenticate, teacherValidation, teacherController.releaseDiscipline);
teacherRouter.get(
	'/get-all-taken-disciplines/:teacherId',
	authenticate,
	teacherValidation,
	teacherController.getAllDisciplinesByTeacherId,
);

teacherRouter.get('/get-discipline/:id', authenticate, teacherValidation, teacherController.getDisciplineById);
