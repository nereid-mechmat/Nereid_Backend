import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import userRep from '../database/repositories/UserRep.ts';

const { GMAIL_MAILER_HOST, GMAIL_MAILER_PORT, GMAIL_MAILER_USERNAME, GMAIL_MAILER_PASSWORD } = process.env;
const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: GMAIL_MAILER_HOST,
	port: Number(GMAIL_MAILER_PORT),
	secure: false,
	auth: {
		user: GMAIL_MAILER_USERNAME,
		pass: GMAIL_MAILER_PASSWORD,
	},
});

export class UserService {
	public static onStartUp = async () => {
		const allRoles = ['admin', 'teacher', 'student'];

		const roles = await userRep.getAllRoles();
		const uniqueRoles = new Set(roles.map((val) => val.name));
		if (
			uniqueRoles.size === 0
			|| allRoles.every((role) => uniqueRoles.has(role))
		) {
			await userRep.deleteAllRoles();
			await userRep.addRoles(allRoles.map((roleName, index) => ({
				id: index,
				name: roleName,
			})));
		}
	};

	generateOtp = () => {
		const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		const otpLength = 6;
		let otp = '';
		for (let i = 0; i < otpLength; i++) {
			const idx = Math.floor(Math.random() * possibleCharacters.length);
			otp += possibleCharacters[idx];
		}

		// expressed in seconds
		const OTP_TTL = Number(process.env['OTP_TTL']);
		const otpExpiredTimestamp = new Date(Date.now() + (OTP_TTL * 1000));

		return { otp, otpExpiredTimestamp, OTP_TTL };
	};

	sendOtp = async (email: string) => {
		const user = await userRep.getUserByEmail(email);

		if (user === undefined) {
			return { userExists: false };
		} else {
			const { otp, otpExpiredTimestamp, OTP_TTL } = this.generateOtp();
			await userRep.editUserById(user.id, { otp, otpExpiredTimestamp });

			await transporter.sendMail({
				from: { name: 'Nereid', address: `${GMAIL_MAILER_USERNAME}` },
				to: email,
				subject: 'Nereid OTP for password recover',
				text: `your OTP: ${otp}. your OTP will expire in ${OTP_TTL} seconds.`,
			});

			return { userExists: true, OTP_TTL };
		}
	};

	checkOtp = async (email: string, submittedOtp: string) => {
		const user = await userRep.getUserByEmail(email);
		if (user === undefined) {
			return { userExists: false };
		}

		const { id, otp, otpExpiredTimestamp, roleName } = user;

		if (otp !== null && otpExpiredTimestamp !== null) {
			const now = new Date();
			if (now <= otpExpiredTimestamp) {
				if (submittedOtp === otp) {
					await userRep.editUserById(id, { otp: null, otpExpiredTimestamp: null });

					const ttl = Number(process.env['JWT_TTL']);
					const JWT_SECRET = String(process.env['JWT_SECRET']);

					const token = jwt.sign(
						{
							userId: id,
							roleName,
						},
						JWT_SECRET,
						{ expiresIn: ttl },
					);

					return { isOtpSent: true, isExpired: false, isOtpValid: true, token };
				}

				return { isOtpSent: true, isExpired: false, isOtpValid: false };
			}

			return { isOtpSent: true, isExpired: true };
		}

		return { isOtpSent: false };
	};

	logIn = async (email: string, password: string) => {
		const user = await userRep.getUserByEmail(email);
		if (user === undefined) {
			return {
				userExists: false,
				isPasswordValid: undefined,
				token: undefined,
			};
		}

		let isPasswordValid: boolean;
		if (user.password.match(/^\d+/) === null) {
			isPasswordValid = await bcrypt.compare(password, user.password);
		} else {
			// test users case
			isPasswordValid = user.password === password ? true : false;
		}

		if (isPasswordValid) {
			const ttl = Number(process.env['JWT_TTL']);
			const JWT_SECRET = String(process.env['JWT_SECRET']);

			const token = jwt.sign(
				{
					userId: user.id,
					roleName: user.roleName,
				},
				JWT_SECRET,
				{ expiresIn: ttl },
			);

			const {
				otp: _1,
				otpExpiredTimestamp: _2,
				password: _3,
				...filteredUser
			} = user;

			return {
				userExists: true,
				isPasswordValid: true,
				token,
				user: filteredUser,
			};
		}

		return {
			userExists: true,
			isPasswordValid: false,
			token: undefined,
		};
	};

	getUser = async (userId: number) => {
		const user = await userRep.getUserById(userId);
		if (user === undefined) {
			return { userExists: false };
		}

		const { otp: _1, otpExpiredTimestamp: _2, password: _3, ...filteredUser } = user;
		return { userExists: true, user: filteredUser };
	};

	changePassword = async (userId: number, password: string) => {
		const saltRounds = Number(process.env['SALT_ROUNDS']);
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		await userRep.editUserById(userId, { password: hashedPassword });
	};

	changeUser = async (
		userId: number,
		body: {
			email: string;
			firstName: string;
			lastName: string;
			patronymic: string;
		},
	) => {
		await userRep.editUserById(userId, body);
	};
}

export default new UserService();
