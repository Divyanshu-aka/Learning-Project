import { Router } from "express";
import {
	registerUser,
	verifyUserEmail,
	loginUser,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
	userRegisterationValidator,
	userLoginValidator,
} from "../validators/validator.js";

const router = Router();

router
	.route("/register")
	.post(
		userRegisterationValidator() /**factory pattern */,
		validate,
		registerUser,
	);
router.route("/verify/:token").get(verifyUserEmail);
router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;
