import { redirect } from "@sveltejs/kit";

export const actions = {
	default: async ({cookies}) => {
		cookies.delete("auth-token",{ path: '/' });
		cookies.delete("email",{ path: '/' });
		cookies.delete("name",{ path: '/' });
		return redirect(303, "/");
	},
};