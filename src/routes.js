const express = require("express");
const router = express.Router();
const { healthcheck } = require("./controller/HealthCheckController");
const UserController = require("./controller/UserController");
require("./controller/UserController");

const userController = new UserController("fish");

// Healthcheck
router.get("/health-check", healthcheck);
router.get("/user", userController.createUser);
router.post("/user", userController.verifyUser);

module.exports = router;
