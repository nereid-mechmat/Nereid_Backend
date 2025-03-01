import type { Context } from 'hono';
import { Hono } from 'hono';
import teacherController from '../controllers/TeacherController.ts';
import { authenticate, teacherValidation } from '../middlewares/Authentication.ts';

export const teacherRouter = new Hono();

teacherRouter.get('/healthy', (c: Context) => {
	return c.text('healthy', 200);
});

teacherRouter.get('/get', authenticate, teacherValidation, teacherController.getTeacherByUserId);
