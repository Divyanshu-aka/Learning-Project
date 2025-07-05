import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import {
	sendMail,
	verificationEmailContentGen,
	forgotPasswordEmailContentGen,
} from "../utils/mail.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
	//get user data from request body
	const { email, username, fullname, password, role } = req.body;

	if (!email || !username || !password) {
		return res.json(
			new ApiResponse(400, "Email, username, and password are required."),
		);
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.json(
				new ApiResponse(400, "User with this email already exists."),
			);
		}

		const newUser = await User.create({
			email,
			fullname,
			username,
			password,
		});
		console.log("New user created:", newUser);

		if (!newUser) {
			return res.json(new ApiResponse(500, "Failed to create user."));
		}

		const Token = crypto.randomBytes(32).toString("hex");

		const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/register/${Token}`;

		sendMail({
			email: newUser.email,
			subject: "qwerty",
			mailGenContent: verificationEmailContentGen(username, verificationUrl),
		});

		res.json(
			new ApiResponse(201, {
				message:
					"User created successfully. Please check your email to verify your account.",
			}),
		);
	} catch (error) {
		console.error("Error creating user:", error);
		return res.json(new ApiResponse(500, "Internal server error."));
	}
});
//login user
//logout user
//verify user email
//resend verification email
//refresh access token
//forgot password request
//change current password
//get current user

export { registerUser };
