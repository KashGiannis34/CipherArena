import { UserAuth } from "$db/models/UserAuth";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "$env/static/private";
import pkg from 'argon2';
const argon2 = pkg;

const email_regexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function get_user(email, password) {
    if (!email) {
        return { error: "Email is required." };
    }

    if (!email.match(email_regexp)) {
        return { error: "Please enter a valid email." };
    }

    const user = await UserAuth.findOne({ email });



    if (!password) {
        return { error: "Password is required." };
    }

    if (!user) {
        return { error: "Email OR Password is not correct." };
    }

    let password_is_correct = false;
    try {
        password_is_correct = await argon2.verify(user.password, password);
    } catch (err) {
        return {error: err};
    }

    if (!password_is_correct) {
        return { error: "Email OR Password is not correct." };
    }

    return { user };
}

export async function login_user(email, password) {
    const info = await get_user(email, password);

    if ("error" in info) {
		return { error: info.error };
	}

    const token = jwt.sign({ id: info.user.id }, SECRET_JWT_KEY);
	return { token, user: info.user };
}