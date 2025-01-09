import { start_mongo } from "$db/mongo";

export const handle = async ({ event, resolve }) => {
  await start_mongo();
  const response = await resolve(event);
  // response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
};