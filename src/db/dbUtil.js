export async function findRandomEntry(schema, query) {
    const count = await schema.countDocuments(query);
    const randomIndex = Math.floor(Math.random() * count);
    const randomObj = await schema.findOne(query).skip(randomIndex);
    return randomObj;
}