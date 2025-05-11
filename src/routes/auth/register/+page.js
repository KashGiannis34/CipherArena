/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  const roomId = url.searchParams.get("roomId");
  return { roomId };
}