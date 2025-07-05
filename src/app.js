import express from "express";
import authRouter from "./routes/auth.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import { ApiError } from "./utils/api-error.js";
import { ApiResponse } from "./utils/api-response.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

// This catches ALL errors passed via next(err)
app.use((err, req, res, next) => {
	if (err instanceof ApiError) {
		return res
			.status(err.statusCode)
			.json(new ApiResponse(err.statusCode, err.errors, err.message));
	}
	// Handle other errors
	res.status(500).json(new ApiResponse(500, [], "Internal Server Error"));
});

export default app;
