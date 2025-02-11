import { UserAuth } from "$db/models/UserAuth";
import pkg from 'argon2';
const argon2 = pkg;

const email_regexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function verify_email(email) {
	if (!email) return "Email is required.";

	if (!email.match(email_regexp))
		return "Please enter a valid email.";

    try {
        const previous_user = await UserAuth.findOne({ $exists: email });
    } catch (err) {
        if (err.code === 11000) {
            throw new Error("There is already an account with this email.");
        }
    }

	return "";
}

function verify_password(password, confirmPass) {
	if (!password) return "Password is required.";

    if (password != confirmPass) return "Password and Confirm Password do not match.";

	if (password.length < 8)
		return "Password must be at least 8 characters.";

	// check for symbols etc. if you wish
    // Check for at least one uppercase letter
    const hasUppercase = /[A-Z]/.test(password);
    if (!hasUppercase) {
        return "Password must contain at least one uppercase letter.";
    }

    // Check for at least one number
    const hasNumber = /[0-9]/.test(password);
    if (!hasNumber) {
        return "Password must contain at least one number.";
    }

    // Check for at least one special character (e.g., !, @, #, $, etc.)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasSpecialChar) {
        return "Password must contain at least one special character (e.g., !, @, #, $, etc.).";
    }

    // Check for spaces (password cannot contain spaces)
    const hasSpace = /\s/.test(password);
    if (hasSpace) {
        return "Password cannot contain spaces.";
    }

	return "";
}

export async function verify_username(name) {
	if (!name) return "Username is required.";

	if (name.length < 5)
		return "Username has to be at least 5 characters.";

    const startsWithLetter = /^[A-Za-z]/.test(name);
    if (!startsWithLetter) {
        return "Username must start with a letter.";
    }

    const invalidChars = /[^A-Za-z0-9_]/.test(name);
    if (invalidChars) {
        return "Username can only contain letters, numbers, and underscores.";
    }

    const previous_user = await UserAuth.findOne({ 'username': name });

	if (previous_user)
        "There is already an account with this username.";

	return "";
}

export async function register_user(name, email, password, confirmPass) {
    const name_error = await verify_username(name);
	if (name_error) return { error: name_error };

	const email_error = await verify_email(email);
	if (email_error) return { error: email_error };

	const password_error = verify_password(password, confirmPass);
	if (password_error) return { error: password_error };

	const hashed_password = await argon2.hash(password);

    let now = new Date();

	const user = new UserAuth({
        'username': name,
		'email': email,
		password: hashed_password,
        lastVerificationRequest: now
	});

	try {
		await user.save();
		return { error: "" };
	} catch (err) {
		return {error: err.toString()};
	}
}