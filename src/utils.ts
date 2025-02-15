import jwt from 'jsonwebtoken';

export const jwtDataGetters = {
	getUserId: (jwtToken: string): number => {
		const { userId } = jwt.decode(jwtToken.replace(/Bearer */, '')) as { userId: number };
		return userId;
	},
	getRoleName: (jwtToken: string): string => {
		const { roleName } = jwt.decode(jwtToken.replace(/Bearer */, '')) as { roleName: string };
		return roleName;
	},
};
