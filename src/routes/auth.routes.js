import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers";
import { validate } from "../middlewares/validator.middlewares";
import { userRegisterationValidator } from "../validators/index.js";

const router = Router();

router
	.route("/register")
	.post(
		userRegisterationValidator() /**factory pattern */,
		validate,
		registerUser,
	);

export default router;
