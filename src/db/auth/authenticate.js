import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "$env/static/private";
import { Cookies } from "@sveltejs/kit";

export function authenticate(cookies) {
	let token = cookies.get("auth-token");
	if (!token) return undefined;
	try {
		const auth = jwt.verify(token, SECRET_JWT_KEY);
		if (!auth) return undefined;
		return auth;
	} catch {
		return undefined;
	}
}