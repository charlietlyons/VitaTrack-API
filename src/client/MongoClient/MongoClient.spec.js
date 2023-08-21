import DailyLog from "../../data/DailyLog.js";
import { logEvent } from "../../util/Logger.js";
import MongoClient from "./MongoClient.js";
import { MongoClient as MongoClientInstance } from "mongodb";
import Intake from "../../data/Intake.js";
import Food from "../../data/Food.js";

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

    it("should return user through callback if present", async () => {
      const mockRecord = "a user if you can believe it";
      const callbackMock = jest.fn();

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.getUser("someUserId", callbackMock);

      expect(callbackMock).toHaveBeenCalledWith(mockRecord);
      expect(logEvent).toHaveBeenCalledWith("User found");
      expect(logEvent).not.toHaveBeenCalledWith("User not found");
    });

    it("should return null through callback if NOT present", async () => {
      const callbackMock = jest.fn();

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(undefined)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.getUser("someUserId", callbackMock);

      expect(callbackMock).toHaveBeenCalledWith(null);
      expect(logEvent).toHaveBeenCalledWith("User not found");
      expect(logEvent).not.toHaveBeenCalledWith("User found");
    });

    it("should delete all users", async () => {
      const callbackMock = jest.fn();
      const deletedCount = 100000;

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteMany: jest
              .fn()
              .mockReturnValue(
                Promise.resolve({ acknowledged: true, deletedCount })
              ),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.deleteAllUsers(callbackMock);

      expect(callbackMock).toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith(
        "User database reset. " + deletedCount + " entries deleted."
      );
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
      const foundCallbackMock = jest.fn();
      const notFoundCallbackMock = jest.fn();

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

      await mongoClient.getUserIntake(
        "someUserId",
        "someDayId",
        foundCallbackMock,
        notFoundCallbackMock
      );

      expect(logEvent).toHaveBeenCalledWith("Intake found");
      expect(foundCallbackMock).toHaveBeenCalledWith(mockRecord);
      expect(notFoundCallbackMock).not.toHaveBeenCalledWith(mockRecord);
    });

    it("should call notFoundCallback if result length is 0", async () => {
      const mockRecord = [];
      const foundCallbackMock = jest.fn();
      const notFoundCallbackMock = jest.fn();

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
      await mongoClient.getUserIntake(
        "someUserId",
        "someDayId",
        foundCallbackMock,
        notFoundCallbackMock
      );

      expect(logEvent).not.toHaveBeenCalledWith("Intake found");
      expect(notFoundCallbackMock).toHaveBeenCalled();
      expect(foundCallbackMock).not.toHaveBeenCalled();
    });
  });

  describe("Food", () => {
    it("should insert dailyLog", () => {
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
        "someName",
        "someCalories",
        "someProtein",
        "someCarbs",
        "someFat",
        "someServingSize",
        "someServingUnit"
      );

      mongoClient.insertFood(food);

      expect(mongoDbMock).toHaveBeenCalledWith(food);
      expect(logEvent).toHaveBeenCalledWith("Food inserted");
    });
  });

  describe("DailyLog", () => {
    it("should insert dailyLog", () => {
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

      mongoClient.insertDailyLog(dailyLog);

      expect(mongoDbMock).toHaveBeenCalledWith(dailyLog);
    });

    it("should return dailyLog to foundCallback if present", async () => {
      const mockRecord = "a daily Log if you can believe it";
      const foundCallback = jest.fn();
      const notFoundCallback = jest.fn();

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(mockRecord)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.getDailyLog(
        "someUserId",
        "11-11-2011",
        foundCallback,
        notFoundCallback
      );

      expect(foundCallback).toHaveBeenCalledWith(mockRecord);
      expect(notFoundCallback).not.toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith("Daily log found");
      expect(logEvent).not.toHaveBeenCalledWith("Daily log not found");
    });

    it("should return result to notFoundCallback if dailyLog not present", async () => {
      const foundCallback = jest.fn();
      const notFoundCallback = jest.fn();

      MongoClientInstance.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(true),
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockReturnValue(Promise.resolve(undefined)),
          }),
        }),
      }));

      const mongoClient = new MongoClient();

      await mongoClient.getDailyLog(
        "someUserId",
        "11-11-2011",
        foundCallback,
        notFoundCallback
      );

      expect(foundCallback).not.toHaveBeenCalled();
      expect(notFoundCallback).toHaveBeenCalledWith(undefined);
      expect(logEvent).not.toHaveBeenCalledWith("Daily log found");
      expect(logEvent).toHaveBeenCalledWith("Daily log not found");
    });
  });
});
