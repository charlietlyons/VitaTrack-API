import DailyLog from "../../data/DailyLog.js";
import { logEvent, logError } from "../../util/Logger.js";
import MongoClient from "./MongoClient.js";
import { MongoClient as MongoClientInstance } from "mongodb";
import Intake from "../../data/Intake.js";
import Food from "../../data/Food.js";
import {
  PRIVATE_ACCESS,
  PUBLIC_ACCESS,
  ADMIN_USERID,
  USER_TABLE,
  INTAKE_TABLE,
  FOOD_TABLE,
  DAYSTAT_TABLE,
} from "../../constants.js";

jest.mock("mongodb", () => {
  return {
    ...jest.requireActual("mongodb"),
    MongoClient: jest.fn(),
  };
});

jest.mock("../../util/Logger.js", () => {
  return {
    logEvent: jest.fn(),
    logError: jest.fn(),
  };
});

describe("MongoClient", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getOneById", () => {
    it("should get one by id", async () => {
      const expectedData = {
        _id: "2e064075-6fad-4ffd-a608-907e3191663e",
        userId: "someUserId",
        name: "Feet",
        calories: 119,
        protein: 3,
        carbs: 10,
        fat: 1,
        servingSize: 3,
        servingUnit: "g",
        access: "PUBLIC_ACCESS",
        description: "The king of all foods",
        imageUrl: "",
      };

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(expectedData)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const foodData = await mongoClient.getOneById(
        FOOD_TABLE,
        "anythingReally"
      );

      expect(logEvent).toHaveBeenCalledWith(
        "food data found with id: anythingReally"
      );
      expect(foodData).toEqual(expectedData);
    });

    it("should log that data was not found", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(null)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.getOneById(FOOD_TABLE, "anythingReally");

      expect(logEvent).toHaveBeenCalledWith(
        "food data not found with id: anythingReally"
      );
    });
  });

  describe("getOneByQuery", () => {
    it("should return result if present", async () => {
      const mockRecord = "a user if you can believe it";

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const user = await mongoClient.getOneByQuery(USER_TABLE, {
        email: "someUserId",
      });

      expect(user).toEqual(mockRecord);
    });

    it("should be undefined if NOT present", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(undefined)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const user = await mongoClient.getOneByQuery(USER_TABLE, {
        email: "someUserId",
      });

      expect(user).toBeUndefined();
    });
  });

  describe("getManyByQuery", () => {
    it("should return result if length is greater than 0", async () => {
      const mockRecord = ["mock get intake body HERE"];

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
            }),
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      await mongoClient.getManyByQuery(INTAKE_TABLE, {
        userId: "someUserId",
        dayId: "someDayId",
      });

      expect(logEvent).toHaveBeenCalledWith("intake data found by query.");
    });

    it("should log not found if result is", async () => {
      const mockRecord = [];

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
            }),
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      const result = await mongoClient.getManyByQuery(INTAKE_TABLE, {
        userId: "someUserId",
        dayId: "someDayId",
      });

      expect(logEvent).toHaveBeenCalledWith("intake data not found by query.");
      expect(logEvent).not.toHaveBeenCalledWith("intake data found by query.");
      expect(result).toEqual(mockRecord);
    });

    it("should use or query if query is an array", async () => {
      const mockRecord = ["mock get intake body HERE"];
      const findMock = jest.fn().mockReturnValue({
        toArray: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
      });

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: findMock,
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      const result = await mongoClient.getManyByQuery(INTAKE_TABLE, [
        { userId: "someUserId", dayId: "someDayId" },
      ]);

      expect(findMock).toHaveBeenCalledWith({
        $or: [{ userId: "someUserId", dayId: "someDayId" }],
      });
    });

    // it("should query public foods and private foods associated with the provided userId", async () => {
    //   const privateFoods = [
    //     { userId: "someUserId", access: PRIVATE_ACCESS },
    //     { userId: "someUserId", access: PRIVATE_ACCESS },
    //     { userId: "someUserId", access: PRIVATE_ACCESS },
    //   ];
    //   const publicFoods = [
    //     { userId: ADMIN_USERID, access: PUBLIC_ACCESS },
    //     { userId: ADMIN_USERID, access: PUBLIC_ACCESS },
    //     { userId: ADMIN_USERID, access: PUBLIC_ACCESS },
    //   ];

    //   MongoClientInstance.mockImplementation(() => ({
    //     connect: jest.fn().mockResolvedValue(this),
    //     db: jest.fn().mockReturnValue({
    //       collection: jest.fn().mockReturnValue({
    //         find: jest.fn().mockReturnValue({
    //           toArray: jest
    //             .fn()
    //             .mockReturnValue(
    //               Promise.resolve([...privateFoods, ...publicFoods])
    //             ),
    //         }),
    //       }),
    //     }),
    //   }));

    //   const mongoClient = new MongoClient();

    //   const foods = await mongoClient.getManyByQuery(FOOD_TABLE, [
    //     { access: "PUBLIC_ACCESS" },
    //     { access: "PRIVATE_ACCESS", userId: "someUserId" },
    //   ]);

    //   expect(foods).toEqual([...privateFoods, ...publicFoods]);
    // });
  });

  describe("post", () => {
    it("should insert user", () => {
      const mongoDbMock = jest
        .fn()
        .mockImplementation(() => "mocked insertOne response");

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: mongoDbMock,
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      mongoClient.insert(USER_TABLE, {
        email: "email",
        password: "password",
      });

      expect(mongoDbMock).toHaveBeenCalledWith({
        email: "email",
        password: "password",
      });
    });

    it("should insert intake", () => {
      const mongoDbMock = jest
        .fn()
        .mockImplementation(() => "mocked insertOne response");

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: mongoDbMock,
          }),
        }),
      }));

      const intake = new Intake(
        "someId",
        "someUserId",
        "someDayId",
        "someFoodId",
        9000
      );

      const mongoClient = new MongoClient();

      mongoClient.insert(INTAKE_TABLE, intake);

      expect(mongoDbMock).toHaveBeenCalledWith({
        _id: "someId",
        userId: "someUserId",
        dayId: "someDayId",
        foodId: "someFoodId",
        quantity: 9000,
      });
    });

    it("should insert dailyLog", async () => {
      const mongoDbMock = jest
        .fn()
        .mockImplementation(() => "mocked insertOne response");

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: mongoDbMock,
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      const dailyLog = new DailyLog(
        "someId",
        "11-12-2020",
        "someUserId",
        "someNotes"
      );

      await mongoClient.insert(DAYSTAT_TABLE, dailyLog);

      expect(mongoDbMock).toHaveBeenCalledWith(dailyLog);
    });

    it("should insert food", async () => {
      const mongoDbMock = jest.fn().mockImplementation(() => {
        return {
          insertedCount: 1,
          insertedId: "someId",
        };
      });

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: mongoDbMock,
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      const food = new Food(
        "someId",
        "someUserId",
        "someName",
        "someCalories",
        "someProtein",
        "someCarbs",
        "someFat",
        "someServingSize",
        "someServingUnit",
        "someAccess",
        "someDescription",
        "someImageUrl"
      );

      await mongoClient.insert(FOOD_TABLE, food);

      expect(mongoDbMock).toHaveBeenCalledWith(food);
      expect(logEvent).toHaveBeenCalledWith(
        "Inserted into food with the id: someId"
      );
    });
  });

  describe("patch", () => {
    it("should logEvent intake update if successful", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockReturnValue({ modifiedCount: 1 }),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.update(INTAKE_TABLE, {
        _id: "someId",
        quantity: 2,
      });
    });

    it("should not throw error intake updated if unsuccessful", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockReturnValue({ modifiedCount: 0 }),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await expect(
        mongoClient.update(INTAKE_TABLE, {
          _id: "someId",
          quantity: 2,
        })
      ).rejects.toThrowError("Could not update intake data with id: someId");
    });
  });

  describe("delete", () => {
    it("should delete intake associated with id", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockReturnValue(true),
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      const result = await mongoClient.delete(INTAKE_TABLE, "someIntakeId");

      expect(logError).toHaveBeenCalledWith(
        "Deleted record in intake of id: someIntakeId"
      );
      expect(result).toEqual(true);
    });

    it("should log error and return false when intake not deleted", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockReturnValue(false),
          }),
        }),
      }));

      const mongoClient = new MongoClient();
      const result = await mongoClient.delete(INTAKE_TABLE, "someIntakeId");

      expect(logError).toHaveBeenCalledWith(
        "Could not delete record in intake of id: someIntakeId"
      );
      expect(result).toEqual(false);
    });
  });

  describe("deleteAll", () => {
    it("should delete all users", async () => {
      const deletedCount = 100000;
      const expectedResponse = { acknowledged: true, deletedCount };

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteMany: jest
              .fn()
              .mockReturnValue(Promise.resolve(expectedResponse)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const result = await mongoClient.deleteAll(USER_TABLE);

      expect(result).toEqual(expectedResponse);
      expect(logEvent).toHaveBeenCalledWith(
        `User table reset. ${deletedCount} entries deleted.`
      );
    });

    it("should not log event if not result", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteMany: jest.fn().mockReturnValue(false),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const result = await mongoClient.deleteAll(USER_TABLE);

      expect(result).toBe(false);
      expect(logEvent).not.toHaveBeenCalled();
    });
  });
});
