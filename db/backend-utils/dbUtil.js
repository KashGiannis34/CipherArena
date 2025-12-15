export async function findRandomEntry(schema, query) {
    const randomObj = await schema.aggregate([
        { $match: query },
        { $sample: { size: 1 } }
    ]);

    // If no document is found, return null
    return randomObj.length > 0 ? randomObj[0] : null;
}

const one_day = 60 * 60 * 24;

export const cookie_options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: one_day,
};