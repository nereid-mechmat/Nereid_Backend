import type { Context } from 'hono';
import { Hono } from 'hono';
import userController from '../controllers/UserController.ts';
import { authenticate } from '../middlewares/Authentication.ts';

export const userRouter = new Hono();

userRouter.get('/healthy', (c: Context) => {
	return c.text('healthy', 200);
});

userRouter.post('/sign-up', userController.sendOtp);

userRouter.post('/log-in', userController.logIn);

userRouter.post('/send-otp', userController.sendOtp);

userRouter.post('/check-otp', userController.checkOtp);

userRouter.get('/get', authenticate, userController.getUser);

userRouter.put('/change-password', authenticate, userController.changePassword);
