import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/dbconnect.js";

// Load environment variables first
dotenv.config({
	path: "./.env",
});

// Define PORT before using it
const PORT = process.env.PORT || 8000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error("Database connection failed:", error);
		process.exit(1); // Exit the process with failure
	});
