import jwt from "jsonwebtoken";
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

export function authenticate(token) {
	if (!token) return undefined;
	try {
		const auth = jwt.verify(token, SECRET_JWT_KEY);
		if (!auth) return undefined;
		return auth;
	} catch {
		return undefined;
	}
}