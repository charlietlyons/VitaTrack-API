import FoodService from "./FoodService";
import Food from "../../data/Food";
import MongoClient from "../../client/MongoClient/MongoClient";
import { expect } from "@jest/globals";

jest.mock("crypto", () => {
  return {
    ...jest.requireActual("crypto"),
    randomUUID: () => "8",
  };
});

describe("Food Service", () => {
  it("should insert food via mongoClient", async () => {
    const insertMock = jest.fn();
    const callbackMock = jest.fn();
    const foodEntity = new Food("8", "gross food", 100, 10, 10, 10, 100, "g");
    const mongoInstance = new MongoClient();

    mongoInstance.insertFood = insertMock;

    const foodService = new FoodService(mongoInstance);

    await foodService.addFood(foodEntity, callbackMock);

    expect(insertMock).toHaveBeenCalledWith(foodEntity);
    expect(callbackMock).toHaveBeenCalled();
  });
});
