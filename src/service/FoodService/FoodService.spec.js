import FoodService from "./FoodService";
import Food from "../../data/Food";
import MongoClient from "../../client/MongoClient/MongoClient";
import { expect } from "@jest/globals";
import { PRIVATE_ACCESS, PUBLIC_ACCESS, ADMIN_USERID } from "../../constants";

jest.mock("crypto", () => {
  return {
    ...jest.requireActual("crypto"),
    randomUUID: () => "8",
  };
});

describe("Food Service", () => {
  it("should insert food via mongoClient", async () => {
    const insertMock = jest.fn();
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

    mongoInstance.insertFood = insertMock;

    const foodService = new FoodService(mongoInstance);

    await foodService.addFood(foodEntity);

    expect(insertMock).toHaveBeenCalledWith(foodEntity);
  });

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

    const getPublicAndPrivateFoodOptionsMock = jest.fn(() => {
      return [...privateFoods, ...publicFoods];
    });

    const mongoInstance = new MongoClient();

    mongoInstance.getPublicAndPrivateFoodOptions =
      getPublicAndPrivateFoodOptionsMock;

    const foodService = new FoodService(mongoInstance);

    const foodOptions = await foodService.getFoodOptions("someUserId");

    expect(foodOptions).toEqual([...privateFoods, ...publicFoods]);
  });

  it("should set default access to private", async () => {
    const insertMock = jest.fn();
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

    mongoInstance.insertFood = insertMock;

    const foodService = new FoodService(mongoInstance);

    await foodService.addFood(foodEntity);

    foodEntity.access = PRIVATE_ACCESS;

    expect(insertMock).toHaveBeenCalledWith(foodEntity);
  });
});
