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

	const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${unhashedToken}`;

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

//verify user email
const verifyUserEmail = asyncHandler(async (req, res) => {
	const { token } = req.params;

	if (!token) {
		return res.json(new ApiResponse(400, "Invalid Token"));
	}

	const hashedtoken = crypto.createHash("sha256").update(token).digest("hex");

	const user = await User.findOne({
		emailVerificationToken: hashedtoken,
		emailVerificationExpiry: { $gt: Date.now() }, // Check if the token is still valid
	});

	if (!user) {
		return res.json(new ApiResponse(404, "User not found or token expired"));
	}

	user.isEmailVerified = true;
	user.emailVerificationToken = undefined; // Clear the token after verification
	user.emailVerificationExpiry = undefined; // Clear the expiry after verification

	await user.save();

	console.log("User email verified:", user);

	res.json(
		new ApiResponse(200, {
			message: "Email verified successfully",
		}),
	);
});

//login user
const loginUser = asyncHandler(async (req, res) => {
	const { email, username, password } = req.body; //get user data from request body
	if ((!email && !username) || !password) {
		return res.json(new ApiResponse(400, "All fields are required."));
	}

	const user = await User.findOne({
		$or: [{ email }, { username }],
	});
	if (!user) {
		return res.json(new ApiResponse(404, "User not found."));
	}

	const verifiedPassword = await user.isPasswordCorrect(password);
	if (!verifiedPassword) {
		return res.json(new ApiResponse(401, "Invalid password."));
	}

	const accessToken = user.generateAccessToken();
	const refreshToken = user.generateRefreshToken();
	user.refreshToken = refreshToken; // Save the refresh token in the user document

	await user.save();

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true, // Use secure cookies in production
		maxAge: 24 * 60 * 60 * 1000, // 24 hrs
	});

	console.log("Logged in user:", user);

	res.json(
		new ApiResponse(200, {
			message: "Login successful",
			data: {
				accessToken,
				user: {
					id: user._id,
					email: user.email,
					username: user.username,
					fullname: user.fullname,
					role: user.role,
				},
			},
		}),
	);
});

//logout user

//resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.json(new ApiResponse(400, "Email is required."));
	}

	const user = await User.findOne({ email });
	if (!user) {
		return res.json(new ApiResponse(404, "User not found."));
	}

	if (user.isEmailVerified) {
		return res.json(new ApiResponse(400, "Email is already verified."));
	}

	const { unhashedToken, hashedToken, tokenExpiry } =
		user.generateTemporaryToken();
	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpiry = tokenExpiry;

	await user.save();

	const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${unhashedToken}`;

	sendMail({
		email: user.email,
		subject: "qwerty - Resend Verification",
		mailGenContent: verificationEmailContentGen(user.username, verificationUrl),
	});

	res.json(
		new ApiResponse(200, {
			message: "Verification email resent successfully.",
		}),
	);
});

//refresh access token
//forgot password request
//change current password
//get current user

export { registerUser, verifyUserEmail, loginUser, resendVerificationEmail };
