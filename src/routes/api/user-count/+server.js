import redis from "$services/redis.js";
import { UserGame } from "$game/UserGame";
import { json } from "@sveltejs/kit";

const USER_COUNT_KEY = "total_user_count";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  let userCount = 0;

  try {
    const cachedCount = await redis.get(USER_COUNT_KEY);

    if (cachedCount) {
      userCount = parseInt(cachedCount, 10);
    } else {
      const dbCount = await UserGame.countDocuments({});
      userCount = dbCount;

      // Cache indefinitely since it's maintained by increment/decrement operations
      await redis.set(USER_COUNT_KEY, userCount);
    }
  } catch (error) {
    console.error("Failed to retrieve user count:", error);
    userCount = 0;
  }

  return json({ userCount });
}
