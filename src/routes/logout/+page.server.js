import { redirect } from "@sveltejs/kit";

export const actions = {
	default: async ({cookies}) => {
		cookies.delete("auth-token",{ path: '/' });
		cookies.delete("email",{ path: '/' });
		cookies.delete("username",{ path: '/' });
		cookies.delete("verified",{ path: '/' });
		return redirect(303, "/");
	},
};