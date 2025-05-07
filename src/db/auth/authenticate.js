import jwt from "jsonwebtoken";
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

export function authenticate(token) {
	if (!token) return undefined;
	try {
		const auth = jwt.verify(decodeURIComponent(token), SECRET_JWT_KEY);
		// console.log("✅ Decoded token:", auth);
		if (!auth) return undefined;
		return auth;
	} catch {
		// console.error("❌ JWT verification failed:", err);
		return undefined;
	}
}