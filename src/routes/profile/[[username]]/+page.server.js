// src/routes/profile/[[username]]/+page.server.js
import { error } from '@sveltejs/kit';
import { UserGame } from '$db/models/UserGame';
import { authenticate } from '$db/auth/authenticate.js';

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
    isOwnProfile
  };
}
