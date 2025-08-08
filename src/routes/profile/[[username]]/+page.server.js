// src/routes/profile/[[username]]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { UserGame } from '$dbutils/UserGame';
import { authenticate } from '$dbutils/authenticate.js';
import { UserAuth } from '$db/models/UserAuth';
import { createVerificationToken } from '$db/auth/verify';
import { sendVerificationEmail } from '$db/auth/mailer';
import { cookie_options } from '$dbutils/dbUtil';
import { VerificationToken } from '$db/models/VerificationToken';

export async function load({ params, cookies }) {
  const auth = authenticate(cookies.get('auth-token'));
  const requestedUsername = params.username;

  let profileUser;
  let isOwnProfile = false;

  if (requestedUsername) {
    profileUser = await UserGame.findOne({ username: requestedUsername }).lean();
  } else if (auth) {
    profileUser = await UserGame.findById(auth.id).lean();
  } else {
    throw error(401, 'Unauthorized');
  }

  if (!profileUser) {
    throw error(404, 'User not found');
  }

  if (auth && profileUser._id.toString() === auth.id) {
    isOwnProfile = true;
  }

  return {
    username: profileUser.username,
    profilePicture: profileUser.profilePicture,
    stats: JSON.stringify(profileUser.stats),
    singleplayerStats: JSON.stringify(profileUser.singleplayerStats),
    isOwnProfile,
    email: isOwnProfile ? cookies.get('email') ?? '' : ''
  };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
  updateEmail: async ({ cookies, request }) => {
    const auth = authenticate(cookies.get('auth-token'));
    if (!auth) throw error(401, 'Unauthorized');

    const formData = await request.formData();
    const newEmail = String(formData.get('email') || '').trim();

    const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegexp.test(newEmail)) {
      return fail(400, { message: 'Please enter a valid email.' });
    }

    const existing = await UserAuth.findOne({
      email: { $regex: `^${newEmail}$`, $options: 'i' }
    }).lean();
    if (existing && existing._id.toString() !== auth.id) {
      return fail(400, { message: 'Email is already in use.' });
    }

    const user = await UserAuth.findById(auth.id);
    if (!user) throw error(404, 'User not found');

    const EXPIRE_LIMIT_MINUTES = 20;

    user.email = newEmail;
    user.verified = false;
    user.lastVerificationRequest = new Date();
    await user.save();

    const token = await createVerificationToken(user, EXPIRE_LIMIT_MINUTES, 'create');
    await sendVerificationEmail(user.email, token, EXPIRE_LIMIT_MINUTES);

    cookies.set('email', user.email, cookie_options);
    cookies.set('verified', false, cookie_options);

    throw redirect(303, '/profile');
  },

  deleteAccount: async ({ cookies }) => {
    const auth = authenticate(cookies.get('auth-token'));
    if (!auth) throw error(401, 'Unauthorized');

    const userId = auth.id;

    // Remove auth and game profiles and any tokens
    await Promise.all([
      UserAuth.deleteOne({ _id: userId }),
      UserGame.deleteOne({ _id: userId }),
      VerificationToken.deleteMany({ userId })
    ]);

    // Clear cookies
    try { cookies.delete('auth-token', { path: '/' }); } catch {}
    try { cookies.delete('email', { path: '/' }); } catch {}
    try { cookies.delete('username', { path: '/' }); } catch {}
    try { cookies.delete('verified', { path: '/' }); } catch {}

    throw redirect(303, '/');
  }
};
