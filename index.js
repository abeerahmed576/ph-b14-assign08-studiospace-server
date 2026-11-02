import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import "dotenv/config";
const app = express();
const PORT = 8000;

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}

app.use(cors());
app.use(express.json());

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studiospace");
const studiosCollection = db.collection("studios");

app.get("/", (req, res) => {
    res.send({ message: "Server is running fine!" });
});

app.get("/studios", async (req, res) => {
    const result = await studiosCollection.find().toArray();
    res.send(result);
});

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});

export default app