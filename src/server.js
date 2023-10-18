import dotenv from "dotenv";
import express from "express";
import { logEvent } from "./util/Logger.js";
import cors from "cors";
import Authenticator from "./middleware/Authenticator.js";
import UserController from "./controller/UserController/UserController.js";
import IntakeController from "./controller/IntakeController/IntakeController.js";
import FoodController from "./controller/FoodController/FoodController.js";
import MongoClient from "./client/MongoClient/MongoClient.js";
import UserService from "./service/UserService/UserService.js";
import DailyLogService from "./service/DailyLogService/DailyLogService.js";
import FoodService from "./service/FoodService/FoodService.js";
import IntakeService from "./service/IntakeService/IntakeService.js";
import { healthcheck } from "./controller/HealthCheckController/HealthCheckController.js";

dotenv.config();

// TODO: refactor the code to use async/await
// TODO: implement a rate limiter
// TODO: caching solution

// CLIENTS
const mongoClient = new MongoClient();

// SERVICES
const userService = new UserService(mongoClient);
const dailyLogService = new DailyLogService(mongoClient);
const foodService = new FoodService(mongoClient);
const intakeService = new IntakeService(mongoClient);

// CONTROLLERS
const userController = new UserController(userService, dailyLogService);
const intakeController = new IntakeController(intakeService);
const foodController = new FoodController(foodService);

const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT, function () {
  logEvent(`Running on port ${PORT}`);
});

// TODO: change later to only enable CORS for development
if (true) {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const router = express.Router();

// Healthcheck
router.get("/health-check", (req, res) => {
  healthcheck(req, res);
});

// Food
router.get("/food", (req, res) => {
  Authenticator.authenticate(req, res, foodController.getFoodOptions);
});
router.post("/food", (req, res) => {
  Authenticator.authenticate(req, res, foodController.addFood);
});
router.patch("/food", (req, res) => {
  Authenticator.authenticate(req, res, foodController.updateFood);
});
router.delete("/food/:id", (req, res) => {
  Authenticator.authenticate(req, res, foodController.deleteFood);
});

// User
router.get("/reset-users", (req, res) =>
  Authenticator.authenticate(req, res, userController.deleteAllUsers)
);
router.get("/account-details", (req, res) =>
  Authenticator.authenticate(req, res, userController.getUserDetails)
);
router.post("/forgot-password", userController.sendForgotPasswordEmail);
router.post("/update-password", (req, res) =>
  Authenticator.authenticate(req, res, userController.updatePassword)
);
router.post("/register-user", userController.createUser);
router.post("/verify-user", userController.verifyUser);
router.post("/verify-token", userController.verifyToken);

// Intake
router.get("/intake", (req, res) => {
  Authenticator.authenticate(req, res, intakeController.getIntake);
});
router.post("/intake", (req, res) => {
  Authenticator.authenticate(req, res, intakeController.addIntake);
});
router.delete("/intake/:id", (req, res) => {
  Authenticator.authenticate(req, res, intakeController.deleteIntake);
});
router.patch("/intake", (req, res) => {
  Authenticator.authenticate(req, res, intakeController.updateIntake);
});
app.use(router);

export default app;
