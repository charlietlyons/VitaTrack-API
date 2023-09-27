import DailyLog from "../../data/DailyLog.js";
import { logEvent } from "../../util/Logger.js";
import MongoClient from "./MongoClient.js";
import { MongoClient as MongoClientInstance } from "mongodb";
import Intake from "../../data/Intake.js";
import Food from "../../data/Food.js";
import {
  PRIVATE_ACCESS,
  PUBLIC_ACCESS,
  ADMIN_USERID,
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
  };
});

describe("MongoClient", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("User", () => {
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

      mongoClient.insertUser({
        email: "email",
        password: "password",
      });

      expect(mongoDbMock).toHaveBeenCalledWith({
        email: "email",
        password: "password",
      });
    });

    it("should return user if present", async () => {
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

      const user = await mongoClient.getUser("someUserId");

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

      const user = await mongoClient.getUser("someUserId");

      expect(user).toBeUndefined();
    });

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

      const result = await mongoClient.deleteAllUsers();

      expect(result).toEqual(expectedResponse);
      expect(logEvent).toHaveBeenCalledWith(
        "User database reset. " + deletedCount + " entries deleted."
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

      const result = await mongoClient.deleteAllUsers();

      expect(result).toBe(false);
      expect(logEvent).not.toHaveBeenCalled();
    });
  });

  describe("Intake", () => {
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

      mongoClient.insertIntake(intake);

      expect(mongoDbMock).toHaveBeenCalledWith({
        _id: "someId",
        userId: "someUserId",
        dayId: "someDayId",
        foodId: "someFoodId",
        quantity: 9000,
      });
    });

    it("should return intake result if result length is greater than 0", async () => {
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

      await mongoClient.getUserIntake("someUserId", "someDayId");

      expect(logEvent).toHaveBeenCalledWith("Intake found");
    });

    it("should call notFoundCallback if result length is 0", async () => {
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
      const result = await mongoClient.getUserIntake("someUserId", "someDayId");

      expect(logEvent).not.toHaveBeenCalledWith("Intake found");
      expect(result).toEqual(mockRecord);
    });
  });

  describe("Food", () => {
    describe("addFood", () => {
      it("should insert food", async () => {
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

        await mongoClient.insertFood(food);

        expect(mongoDbMock).toHaveBeenCalledWith(food);
        expect(logEvent).toHaveBeenCalledWith("Food inserted");
      });
    });

    describe("getFoodDataByIntakeId", () => {
      it("should get food data by id", async () => {
        const expectedData = {
                        "_id": "2e064075-6fad-4ffd-a608-907e3191663e",
                        "userId": "someUserId",
                        "name": "Feet",
                        "calories": 119,
                        "protein": 3,
                        "carbs": 10,
                        "fat": 1,
                        "servingSize": 3,
                        "servingUnit": "g",
                        "access": "PUBLIC_ACCESS",
                        "description": "The king of all foods",
                        "imageUrl": ""
                      }
        
        MongoClientInstance.mockImplementation(() => ({
          connect: jest.fn().mockResolvedValue(this),
          db: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              findOne: jest.fn()
                .mockReturnValue(
                  Promise.resolve(
                    expectedData
                  )
                ),
            }),
          }),
        }));
      
      const mongoClient = new MongoClient();

      const foodData = await mongoClient.getFoodDataByIntakeId("anythingReally")

      expect(foodData).toEqual(expectedData)
      })

      it("should log that food data was not found", async () => {
        MongoClientInstance.mockImplementation(() => ({
          connect: jest.fn().mockResolvedValue(this),
          db: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              findOne: jest.fn()
                .mockReturnValue(
                  Promise.resolve(
                    null
                  )
                ),
            }),
          }),
        }));
      
      const mongoClient = new MongoClient();

      await mongoClient.getFoodDataByIntakeId("anythingReally")

      expect(logEvent).toHaveBeenCalledWith("Food data not found")
      })
    });

    describe("getPublicAndPrivateFoodOptions", () => {
      it("should query public foods and private foods associated with the provided userId", async () => {
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

        MongoClientInstance.mockImplementation(() => ({
          connect: jest.fn().mockResolvedValue(this),
          db: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              find: jest.fn().mockReturnValue({
                toArray: jest
                  .fn()
                  .mockReturnValue(
                    Promise.resolve([...privateFoods, ...publicFoods])
                  ),
              }),
            }),
          }),
        }));

        const mongoClient = new MongoClient();

        const foods = await mongoClient.getPublicAndPrivateFoodOptions(
          "someUserId"
        );

        expect(foods).toEqual([...privateFoods, ...publicFoods]);
      });
    });
  });

  describe("DailyLog", () => {
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

      await mongoClient.insertDailyLog(dailyLog);

      expect(mongoDbMock).toHaveBeenCalledWith(dailyLog);
    });

    it("should return dailyLog to foundCallback if present", async () => {
      const mockRecord = "a daily Log if you can believe it";

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const dailyLog = await mongoClient.getDailyLog(
        "someUserId",
        "11-11-2011"
      );

      expect(dailyLog).toEqual(mockRecord);
      expect(logEvent).toHaveBeenCalledWith("Daily log found");
      expect(logEvent).not.toHaveBeenCalledWith("Daily log not found");
    });

    it("should return result if dailyLog not present", async () => {
      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(undefined)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      const dailyLog = await mongoClient.getDailyLog(
        "someUserId",
        "11-11-2011"
      );

      expect(dailyLog).toBeUndefined();
      expect(logEvent).not.toHaveBeenCalledWith("Daily log found");
      expect(logEvent).toHaveBeenCalledWith("Daily log not found");
    });
  });
});
