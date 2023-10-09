import FoodService from "./FoodService";
import Food from "../../data/Food";
import MongoClient from "../../client/MongoClient/MongoClient";
import { expect } from "@jest/globals";
import {
  PRIVATE_ACCESS,
  PUBLIC_ACCESS,
  ADMIN_USERID,
  FOOD_TABLE,
} from "../../constants";

jest.mock("crypto", () => {
  return {
    ...jest.requireActual("crypto"),
    randomUUID: () => "8",
  };
});

describe("Food Service", () => {
  describe("addFood", () => {
    it("should insert food via mongoClient", async () => {
      const postMock = jest.fn();
      const foodEntity = new Food(
        "8",
        "someUserId",
        "gross food",
        100,
        10,
        10,
        10,
        100,
        "g",
        PUBLIC_ACCESS,
        "some food",
        "url.com"
      );
      const mongoInstance = new MongoClient();

      mongoInstance.post = postMock;

      const foodService = new FoodService(mongoInstance);

      await foodService.addFood(foodEntity);

      expect(postMock).toHaveBeenCalledWith(FOOD_TABLE, foodEntity);
    });

    it("should set default access to private", async () => {
      const postMock = jest.fn();
      const foodEntity = new Food(
        "8",
        "someUserId",
        "gross food",
        100,
        10,
        10,
        10,
        100,
        "g",
        "addd",
        "some food",
        "url.com"
      );
      const mongoInstance = new MongoClient();

      mongoInstance.post = postMock;

      const foodService = new FoodService(mongoInstance);

      await foodService.addFood(foodEntity);

      foodEntity.access = PRIVATE_ACCESS;

      expect(postMock).toHaveBeenCalledWith(FOOD_TABLE, foodEntity);
    });
  });

  describe("getFoodOptions", () => {
    it("should return a list of public foods and custom foods corresponding with userId", async () => {
      const privateFoods = [
        { userId: "someUserId", access: PRIVATE_ACCESS },
        { userId: "someUserId", access: PRIVATE_ACCESS },
        { userId: "someUserId", access: PRIVATE_ACCESS },
      ];
      const publicFoods = [
        { userId: ADMIN_USERID, access: PUBLIC_ACCESS },
        { userId: ADMIN_USERID, access: PUBLIC_ACCESS },
        { userId: ADMIN_USERID, access: PUBLIC_ACCESS },
      ];

      const getManyByQueryMock = jest.fn(() => {
        return [...privateFoods, ...publicFoods];
      });

      const mongoInstance = new MongoClient();

      mongoInstance.getManyByQuery = getManyByQueryMock;

      const foodService = new FoodService(mongoInstance);

      const foodOptions = await foodService.getFoodOptions("someUserId");

      expect(foodOptions).toEqual([...privateFoods, ...publicFoods]);
    });
  });

  describe("updateFood", () => {
    it("should update food", async () => {
      const payload = {
        _id: "someId",
        userId: "someUserId",
        name: "gross food",
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 10,
        servingSize: 100,
        servingUnit: "g",
        access: PUBLIC_ACCESS,
        description: "some food",
        imageUrl: "url.com",
      };
      const mongoClient = new MongoClient();
      const patchMock = jest.fn().mockImplementation(() => {
        return true;
      });

      mongoClient.patch = patchMock;

      const foodService = new FoodService(mongoClient);

      await foodService.updateFood(payload);

      expect(patchMock).toBeCalledWith(FOOD_TABLE, payload);
    });
  });

  describe("deleteFood", () => {
    it("should delete food", async () => {
      const mongoClient = new MongoClient();
      const deleteMock = jest.fn().mockImplementation(() => {
        return true;
      });

      mongoClient.delete = deleteMock;

      const foodService = new FoodService(mongoClient);

      await foodService.deleteFood("someId");

      expect(deleteMock).toBeCalledWith(FOOD_TABLE, "someId");
    });
  });
});
