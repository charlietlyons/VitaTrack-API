import express from "express";
import UserController from "./controller/UserController.js";
import { healthcheck } from "./controller/HealthCheckController.js";

const router = express.Router();

const userController = new UserController();

// Healthcheck
router.get("/health-check", healthcheck);

// User
router.post("/register-user", userController.createUser);
router.post("/verify-user", userController.verifyUser);
router.post("/verify-token", userController.verifyToken);

export default router;
