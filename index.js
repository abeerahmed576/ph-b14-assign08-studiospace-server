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
    ("You successfully connected to MongoDB!");
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
const bookingsCollection = db.collection("bookings");

app.get("/", (req, res) => {
  res.send({ message: "Server is running fine!" });
});

app.get("/studios", async (req, res) => {
  const category = req.query.category || "all";
  let result = [];
  if (category === "all") result = await studiosCollection.find().toArray();
  else result = await studiosCollection.find({ category: category }).toArray();
  res.send(result);
});

app.get("/studios/:id", async (req, res) => {
  const { id } = req.params;
  const result = await studiosCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

app.get("/studios/user/:email", async (req, res) => {
  const { email } = req.params;
  const result = await studiosCollection
    .find({
      "host.email": email,
    })
    .toArray();
  res.send(result);
});

app.patch("/studios/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const result = await studiosCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data },
  );
  res.json(result);
});

app.delete("/studios/:id", async (req, res) => {
  const { id } = req.params;
  const result = await studiosCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.json(result);
});

app.post("/dashboard/add-studio", async (req, res) => {
  const data = req.body;
  const result = await studiosCollection.insertOne(data);
  res.send(result);
});

app.post("/bookings", async (req, res) => {
  const data = req.body;
  const prevBookings = await bookingsCollection
    .find({ status: "Confirmed", "studio._id": data.studio._id })
    .toArray();
  console.log(prevBookings);
  const conflict = prevBookings.some(
    (item) => item.bookingDate === data.bookingDate,
  );
  console.log(conflict);
  if (conflict)
    return res.status(409).send({
      message: "The requested studio is already booked for the selected date",
    });
  const result = await bookingsCollection.insertOne(data);
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

export default app;
