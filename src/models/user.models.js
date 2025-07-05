import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
	{
		avatar: {
			type: {
				url: String,
				localpath: String, // Local path for the avatar image
			},
			default: {
				url: "", // Default URL for the avatar image
				localpath: "", // Default local path for the avatar image
			},
		},

		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullname: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		isEmailVerified: {
			type: Boolean,
			default: false, // Default value is false
		},
		forgotPasswordToken: {
			type: String, // Token for password reset
		},
		forgotPasswordExpiry: {
			type: Date, // Expiry date for the password reset token
		},
		refeshToken: {
			type: String, // Refresh token for user sessions
		},
		emailVerificationToken: {
			type: String, // Token for email verification
		},
		emailVerificationExpiry: {
			type: Date, // Expiry date for the email verification token
		},
	},

	{ timestamps: true },
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		},
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		},
	);
};

userSchema.methods.generateTemporaryToken = function () {
	const unhashedToken = crypto.randomBytes(32).toString("hex");

	const hashedToken = crypto
		.createHash("sha256")
		.update(unhashedToken)
		.digest("hex");

	const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

	return { hashedToken, unhashedToken, tokenExpiry };
};

export const User = new mongoose.model("User", userSchema);
