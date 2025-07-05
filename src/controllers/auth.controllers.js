import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import {
	sendMail,
	verificationEmailContentGen,
	forgotPasswordEmailContentGen,
} from "../utils/mail.js";

const registerUser = asyncHandler(async (req, res) => {
	const { email, username, fullname, password, role } = req.body; //get user data from request body

	if (!email || !username || !password) {
		return res.json(
			new ApiResponse(400, "Email, username, and password are required."),
		);
	}

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

	if (!newUser) {
		return res.json(new ApiResponse(500, "Failed to create user."));
	}

	const { unhashedToken, hashedToken, tokenExpiry } =
		newUser.generateTemporaryToken();
	newUser.emailVerificationToken = hashedToken;
	newUser.emailVerificationExpiry = tokenExpiry;

	await newUser.save(); // Save the user with the verification token and expiry

	const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/register/${unhashedToken}`;

	sendMail({
		email: newUser.email,
		subject: "qwerty",
		mailGenContent: verificationEmailContentGen(username, verificationUrl),
	});

	console.log("New user created:", newUser);

	res.json(
		new ApiResponse(201, {
			message:
				"User created successfully. Please check your email to verify your account.",
		}),
	);
});

//login user
const loginUser = asyncHandler(async (req, res) => {});

//logout user
//verify user email
//resend verification email
//refresh access token
//forgot password request
//change current password
//get current user

export { registerUser, loginUser };
