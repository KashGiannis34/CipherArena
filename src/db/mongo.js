import { MONGO_URL } from "$env/static/private";
import { mongoose } from 'mongoose'

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true, useNewUrlParser: true, useUnifiedTopology: true } };
export async function start_mongo() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    if (!mongoose.connection.readyState) {
        await mongoose.connect(MONGO_URL, clientOptions);
    }
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.log(err);
  }
}