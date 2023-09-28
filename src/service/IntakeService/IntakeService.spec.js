import MongoClient from "../../client/MongoClient/MongoClient";
import IntakeService from "./IntakeService";
import Intake from "../../data/Intake";

jest.mock("crypto", () => {
  return {
    ...jest.requireActual("crypto"),
    randomUUID: () => "8",
  };
});

describe("IntakeService", () => {
  describe("getUserIntake", () => {
    let userId, dailyLogId, intakeId, date;

    beforeEach(() => {
      userId = "someUser";
      dailyLogId = "someDailyLog";
      intakeId = "someIntake";
      date = "someDate";
    });

    it("should get user intake if user is real, daily log is present, and intake is plentiful", async () => {
      const mongoClient = new MongoClient();
      const getUserMock = jest.fn().mockImplementation((user) => {
        return { _id: userId };
      });
      const getDailyLogMock = jest.fn().mockImplementation((userId, date) => {
        return { _id: dailyLogId };
      });
      const getIntakeMock = jest.fn().mockImplementation((userId, logId) => {
        return [{ _id: intakeId, quantity: 1 }];
      });

      const getFoodDataByIntakeIdMock = jest
        .fn()
        .mockImplementation((foodId) => {
          return {
            _id: foodId,
            userId: "someUserId",
            name: "My foot",
            calories: 1000,
            protein: 500,
            carbs: 0,
            fat: 0.5,
            servingSize: 1,
            servingUnit: "foot",
            access: "PUBLIC_ACCESS",
            description: "It's my foot.",
            imageUrl: "www.imageofmyfoot.com",
          };
        });

      mongoClient.getUser = getUserMock;
      mongoClient.getUserIntake = getIntakeMock;
      mongoClient.getDailyLog = getDailyLogMock;
      mongoClient.getFoodDataByIntakeId = getFoodDataByIntakeIdMock;

      const intakeService = new IntakeService(mongoClient);

      await intakeService.getUserIntake(userId, date);
      expect(mongoClient.getUser).toHaveBeenCalledWith(userId);
      expect(getUserMock).toHaveBeenCalledWith(userId);
      expect(getDailyLogMock).toHaveBeenCalledWith(userId, date);
      expect(getIntakeMock).toHaveBeenCalledWith(userId, dailyLogId);
    });

    it("should throw error if user doesn't exist", async () => {
      const mongoClient = new MongoClient();
      const getUserSpy = jest.fn().mockImplementation((user) => {
        return null;
      });
      const getDailyLogSpy = jest.fn();
      const getIntakeSpy = jest.fn();
      mongoClient.getUser = getUserSpy;
      mongoClient.getUserIntake = getIntakeSpy;
      mongoClient.getDailyLog = getDailyLogSpy;

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserIntake(userId, date)
      ).rejects.toThrowError("Could not get user data for userId: someUser");

      expect(mongoClient.getUser).toHaveBeenCalledWith(userId);
      expect(getUserSpy).toHaveBeenCalledWith(userId);
      expect(getDailyLogSpy).not.toHaveBeenCalled();
      expect(getIntakeSpy).not.toHaveBeenCalled();
    });

    it("should fail handle if daily log doesn't exist", async () => {
      const userId = "someUser";
      const date = "someDate";
      const mongoClient = new MongoClient();
      const getUserSpy = jest.fn().mockImplementation((user) => {
        return { _id: userId };
      });
      const getDailyLogSpy = jest.fn().mockImplementation((userId, date) => {
        return null;
      });
      mongoClient.getUser = getUserSpy;
      mongoClient.getDailyLog = getDailyLogSpy;
      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserIntake(userId, date)
      ).rejects.toThrowError(
        `Could not get dailyLog for userId: ${userId} on ${date}`
      );

      expect(mongoClient.getUser).toHaveBeenCalledWith(userId);
      expect(getUserSpy).toHaveBeenCalledWith(userId);
      expect(getDailyLogSpy).toHaveBeenCalledWith(userId, date);
    });

    it("should fail handle if user intake doesn't exist", async () => {
      const userId = "someUser";
      const date = "someDate";
      const dailyLogId = "someDailyLog";
      const mongoClient = new MongoClient();
      const getUserSpy = jest.fn().mockImplementation((user) => {
        return { _id: userId };
      });
      const getDailyLogSpy = jest.fn().mockImplementation((userId, date) => {
        return { _id: dailyLogId };
      });
      const getIntakeSpy = jest.fn().mockImplementation((userId, logId) => {
        return null;
      });
      mongoClient.getUser = getUserSpy;
      mongoClient.getUserIntake = getIntakeSpy;
      mongoClient.getDailyLog = getDailyLogSpy;

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserIntake(userId, date)
      ).rejects.toThrowError(`Could not get intake data for userId: ${userId}`);

      expect(mongoClient.getUser).toHaveBeenCalledWith(userId);
      expect(getUserSpy).toHaveBeenCalledWith(userId);
      expect(getDailyLogSpy).toHaveBeenCalledWith(userId, date);
      expect(getIntakeSpy).toHaveBeenCalledWith(userId, dailyLogId);
    });
  });

  describe("deleteIntake", () => {
    it("should return intake", async () => {
      const mongoClient = new MongoClient();
      const deleteIntakeMock = jest.fn().mockImplementation((user) => {
        return true;
      });

      mongoClient.deleteIntake = deleteIntakeMock;
      const intakeService = new IntakeService(mongoClient);

      const result = await intakeService.deleteIntake("someIntakeId");

      expect(result).toBe(true);
      expect(deleteIntakeMock).toHaveBeenCalled();
    });
  });

  describe("addIntake", () => {
    it("should add intake when user and daily log is present", async () => {
      const userId = "someUserId",
        logId = "logId",
        foodId = "foodId";

      const expected = new Intake("8", userId, logId, foodId, 1);
      const mongoClient = new MongoClient();
      mongoClient.getUser = jest.fn().mockImplementation((user) => {
        return { _id: userId };
      });
      mongoClient.getDailyLog = jest.fn().mockImplementation((userId, date) => {
        return { _id: logId };
      });
      mongoClient.insertIntake = jest.fn();
      const intakeService = new IntakeService(mongoClient);

      const insertedEntity = await intakeService.addIntake({
        foodId: foodId,
        quantity: 1,
      });
      expect(mongoClient.insertIntake).toHaveBeenCalledWith(expected);
      expect(insertedEntity).toEqual(expected);
    });
  });
});
