import e from "express";
import { asyncHandler } from "../utils/async-handler.js";

const registerUser = asyncHandler((req, res) => {
	//get user data from request body
	const { email, username, password, role } = req.body;

	//validation
});

export { registerUser };
