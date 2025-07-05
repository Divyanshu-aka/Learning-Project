import express from "express";
import authRouter from "./routes/auth.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

export default app;
