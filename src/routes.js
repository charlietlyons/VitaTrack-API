import express from "express";
import UserController from "./controller/UserController/UserController.js";
import IntakeController from "./controller/IntakeController/IntakeController.js";
import FoodController from "./controller/FoodController/FoodController.js";
import MongoClient from "./client/MongoClient/MongoClient.js";
import UserService from "./service/UserService/UserService.js";
import DailyLogService from "./service/DailyLogService/DailyLogService.js";
import FoodService from "./service/FoodService/FoodService.js";
import IntakeService from "./service/IntakeService/IntakeService.js";
import { healthcheck } from "./controller/HealthCheckController/HealthCheckController.js";
import dotenv from "dotenv";
import Authenticator from "./middleware/Authenticator.js";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const router = express.Router();

const mongoClient = new MongoClient();
const userService = new UserService(mongoClient);
const dailyLogService = new DailyLogService(mongoClient);
const foodService = new FoodService(mongoClient);
const intakeService = new IntakeService(mongoClient);
const userController = new UserController(userService, dailyLogService);
const intakeController = new IntakeController(intakeService);
const foodController = new FoodController(foodService);

// Healthcheck
router.get("/health-check", (req, res) => {
  healthcheck(req, res);
});

// Food
router.post("/food", (req, res) => {
  Authenticator.authenticate(req, res, foodController.addFood);
});

// User
router.get("/reset-users", (req, res) =>
  Authenticator.authenticate(req, res, userController.deleteAll)
);
router.get("/account-details", (req, res) =>
  Authenticator.authenticate(req, res, userController.getUserDetails)
);
router.post("/register-user", userController.createUser);
router.post("/verify-user", userController.verifyUser);
router.post("/verify-token", userController.verifyToken);

// Intake
router.get("/intake", (req, res) => {
  Authenticator.authenticate(req, res, intakeController.getIntake);
});
router.post("/add-intake", (req, res) => {
  Authenticator.authenticate(req, res, intakeController.addIntake);
});

export default router;
