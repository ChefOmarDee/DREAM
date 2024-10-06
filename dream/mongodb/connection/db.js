const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function ConnectToDatabase() {
	try {
		await mongoose.connect("mongodb+srv://DreamHacks:Quoc@cluster0.rez7l.mongodb.net/DreamDB?retryWrites=true&w=majority&appName=Cluster0");
		console.log("Connected to MongoDB with Mongoose");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
}

module.exports = { ConnectToDatabase };