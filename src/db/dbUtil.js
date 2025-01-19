// export async function findRandomEntry(schema, query) {
//     const count = await schema.countDocuments(query);
//     const randomIndex = Math.floor(Math.random() * count);
//     const randomObj = await schema.findOne(query).skip(randomIndex);
//     return randomObj;
// }
export async function findRandomEntry(schema, query) {
    const randomObj = await schema.aggregate([
        { $match: query },    // Apply the query filter
        { $sample: { size: 1 } } // Randomly sample 1 document
    ]);

    // If no document is found, return null
    return randomObj.length > 0 ? randomObj[0] : null;
}