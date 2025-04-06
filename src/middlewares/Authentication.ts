import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { jwtDataGetters } from '../utils.ts';

export const authenticate = async (c: Context, next: Next) => {
	let token = c.req.header('authorization');
	if (token === undefined) {
		c.status(400);
		return c.json({
			message: 'no access token was provided.',
		});
	}

	token = token.includes('Bearer ') ? token.split(' ')[1]! : token;
	const { JWT_SECRET } = process.env;
	try {
		jwt.verify(token, JWT_SECRET!);
		return await next();
	} catch {
		c.status(400);
		return c.json({ message: 'Invalid token.' });
	}
};

export const adminValidation = async (c: Context, next: Next) => {
	const token = c.req.header('authorization')!;
	const roleName = jwtDataGetters.getRoleName(token);
	if (roleName !== 'admin') {
		c.status(400);
		return c.json({
			message: "you don't have 'admin' role.",
		});
	}

	return await next();
};

export const teacherValidation = async (c: Context, next: Next) => {
	const token = c.req.header('authorization')!;
	const roleName = jwtDataGetters.getRoleName(token);
	if (roleName !== 'teacher') {
		c.status(400);
		return c.json({
			message: "you don't have 'teacher' role.",
		});
	}

	return await next();
};

export const studentValidation = async (c: Context, next: Next) => {
	const token = c.req.header('authorization')!;
	const roleName = jwtDataGetters.getRoleName(token);
	if (roleName !== 'student') {
		c.status(400);
		return c.json({
			message: "you don't have 'student' role.",
		});
	}

	return await next();
};
