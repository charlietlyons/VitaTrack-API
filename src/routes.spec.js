import request from "supertest";
import app from "./server.js";
import FoodController from "./controller/FoodController/FoodController.js";
import MongoClient from "./client/MongoClient/MongoClient.js";
import Authenticator from "./middleware/Authenticator.js";
import IntakeController from "./controller/IntakeController/IntakeController.js";
import UserController from "./controller/UserController/UserController.js";

describe("routes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return a 200 for health-check", async () => {
    const response = await request(app).get("/health-check").expect(200);

    expect(response.text).toEqual("UP");
  });
});
