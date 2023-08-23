import { expect } from "@jest/globals";
import MongoClient from "../../client/MongoClient/MongoClient";
import FoodService from "../../service/FoodService/FoodService";
import FoodController from "./FoodController";
import { logError } from "../../util/Logger";

jest.mock("../../util/Logger.js", () => ({
  logError: jest.fn(),
}));

describe("FoodController", () => {
  it("should call food service to add new food", () => {
    const mongoClient = new MongoClient();
    const foodService = new FoodService(mongoClient);

    const payload = {
      name: "gross food",
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 10,
      servingSize: 100,
      servingUnit: "g",
    };
    const mockAddFood = jest.fn().mockImplementation((body, callback) => {
      callback();
    });
    const sendMock = jest.fn();

    foodService.addFood = mockAddFood;

    const foodController = new FoodController(foodService);

    foodController.addFood({ body: payload }, { send: sendMock });

    expect(mockAddFood).toHaveBeenCalledWith(payload, expect.any(Function));
    expect(foodController).toBeDefined();
    expect(sendMock).toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it("should call logError when food service throws an error", () => {
    const mongoClient = new MongoClient();
    const foodService = new FoodService(mongoClient);

    const payload = {
      name: "gross food",
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 10,
      servingSize: 100,
      servingUnit: "g",
    };
    const mockAddFood = jest.fn().mockImplementation(() => {
      throw Error("hate this food");
    });
    const sendMock = jest.fn();

    foodService.addFood = mockAddFood;

    const foodController = new FoodController(foodService);

    foodController.addFood({ body: payload }, { send: sendMock });

    expect(mockAddFood).toHaveBeenCalledWith(payload, expect.any(Function));
    expect(foodController).toBeDefined();
    expect(logError).toHaveBeenCalled();
  });
});
