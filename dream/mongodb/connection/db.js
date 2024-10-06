const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function ConnectToDatabase() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB with Mongoose");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
}

module.exports = { ConnectToDatabase };