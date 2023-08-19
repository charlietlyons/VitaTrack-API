import express from "express";
import UserController from "./controller/UserController.js";
import IntakeController from "./controller/IntakeController/IntakeController.js";
import FoodController from "./controller/FoodController/FoodController.js";
import MongoClient from "./client/MongoClient.js";
import UserService from "./service/UserService.js";
import DailyLogService from "./service/DailyLogService.js";
import FoodService from "./service/FoodService.js";
import IntakeService from "./service/IntakeService.js";
import { healthcheck } from "./controller/HealthCheckController.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { logError } from "./util/Logger.js";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const router = express.Router();

const mongoClient = new MongoClient();
const userService = new UserService(mongoClient);
const dailyLogService = new DailyLogService(mongoClient);
const foodService = new FoodService(mongoClient);
const intakeService = new IntakeService(mongoClient);
const userController =new UserController(userService, dailyLogService);
const intakeController = new IntakeController(intakeService);
const foodController = new FoodController(foodService);

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logError("No token");
    return res.status(401).send({ error: "No token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, data) => {
      if (error) {
        logError(error);
        return res.status(403).send("Invalid token");
      } else {
        next(req, res, data);
      }
    });
  } catch (error) {
    logError("Invalid token");
    return res.status(403).send(error);
  }
}

// Healthcheck
router.get("/health-check", healthcheck);

// Food
router.post("/food", (req, res) => {
  authenticate(req, res, foodController.addFood)
});

// User
router.get("/reset-users", (req, res) =>
  authenticate(req, res, userController.deleteAll)
);
router.get("/account-details", (req, res) =>
  authenticate(req, res, userController.getUserDetails)
);
router.post("/register-user", userController.createUser);
router.post("/verify-user", userController.verifyUser);
router.post("/verify-token", userController.verifyToken);

// Intake
router.get("/intake" , (req, res) => {
  authenticate(req, res, intakeController.getIntake);
});
router.post("/add-intake", (req, res) => {
  authenticate(req, res, intakeController.addIntake);
})

export default router;
