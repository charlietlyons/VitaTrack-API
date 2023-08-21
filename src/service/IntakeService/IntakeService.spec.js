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
    it("should get user intake if user is real, daily log is present, and intake is plentiful", async () => {
      const userId = "someUser";
      const dailyLogId = "someDailyLog";
      const intakeId = "someIntake";
      const date = "someDate";
      const successHandlerSpy = jest.fn();
      const failHandlerSpy = jest.fn();
      const mongoClient = new MongoClient();
      const findUserSpy = jest.fn().mockImplementation((user, callback) => {
        callback({ _id: userId });
      });
      const getDailyLogSpy = jest
        .fn()
        .mockImplementation((userId, date, success, failure) => {
          success({ _id: dailyLogId });
        });
      const getIntakeSpy = jest
        .fn()
        .mockImplementation((userId, logId, found, notFound) => {
          found([{ _id: intakeId, quantity: 1 }]);
        });
      mongoClient.findUser = findUserSpy;
      mongoClient.getUserIntake = getIntakeSpy;
      mongoClient.getDailyLog = getDailyLogSpy;

      const intakeService = new IntakeService(mongoClient);

      intakeService.getUserIntake(
        userId,
        date,
        successHandlerSpy,
        failHandlerSpy
      );
      expect(successHandlerSpy).toHaveBeenCalled();
      expect(failHandlerSpy).not.toHaveBeenCalled();
      expect(mongoClient.findUser).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(findUserSpy).toHaveBeenCalledWith(userId, expect.any(Function));
      expect(getDailyLogSpy).toHaveBeenCalledWith(
        userId,
        date,
        expect.any(Function),
        expect.any(Function)
      );
      expect(getIntakeSpy).toHaveBeenCalledWith(
        userId,
        dailyLogId,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("should fail handle if user doesn't exist", () => {
      const userId = "someUser";
      const date = "someDate";
      const successHandlerSpy = jest.fn();
      const failHandlerSpy = jest.fn();
      const mongoClient = new MongoClient();
      const findUserSpy = jest.fn().mockImplementation((user, callback) => {
        callback(null);
      });
      const getDailyLogSpy = jest.fn();
      const getIntakeSpy = jest.fn();
      mongoClient.findUser = findUserSpy;
      mongoClient.getUserIntake = getIntakeSpy;
      mongoClient.getDailyLog = getDailyLogSpy;

      const intakeService = new IntakeService(mongoClient);

      intakeService.getUserIntake(
        userId,
        date,
        successHandlerSpy,
        failHandlerSpy
      );

      expect(failHandlerSpy).toHaveBeenCalled();
      expect(successHandlerSpy).not.toHaveBeenCalled();
      expect(mongoClient.findUser).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(findUserSpy).toHaveBeenCalledWith(userId, expect.any(Function));
      expect(getDailyLogSpy).not.toHaveBeenCalled();
      expect(getIntakeSpy).not.toHaveBeenCalled();
    });

    it("should fail handle if daily log doesn't exist", () => {
      const userId = "someUser";
      const date = "someDate";
      const successHandlerSpy = jest.fn();
      const failHandlerSpy = jest.fn();
      const mongoClient = new MongoClient();
      const findUserSpy = jest.fn().mockImplementation((user, callback) => {
        callback({ _id: userId });
      });
      const getDailyLogSpy = jest
        .fn()
        .mockImplementation((userId, date, success, failure) => {
          failure();
        });
      const getIntakeSpy = jest.fn();
      mongoClient.findUser = findUserSpy;
      mongoClient.getUserIntake = getIntakeSpy;
      mongoClient.getDailyLog = getDailyLogSpy;

      const intakeService = new IntakeService(mongoClient);

      intakeService.getUserIntake(
        userId,
        date,
        successHandlerSpy,
        failHandlerSpy
      );

      expect(failHandlerSpy).toHaveBeenCalled();
      expect(successHandlerSpy).not.toHaveBeenCalled();
      expect(mongoClient.findUser).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(findUserSpy).toHaveBeenCalledWith(userId, expect.any(Function));
      expect(getDailyLogSpy).toHaveBeenCalledWith(
        userId,
        date,
        expect.any(Function),
        expect.any(Function)
      );
      expect(getIntakeSpy).not.toHaveBeenCalled();
    });

    it("should fail handle if user intake doesn't exist", () => {
      const userId = "someUser";
      const date = "someDate";
      const dailyLogId = "someDailyLog";
      const intakeId = "someIntake";
      const successHandlerSpy = jest.fn();
      const failHandlerSpy = jest.fn();
      const mongoClient = new MongoClient();
      const findUserSpy = jest.fn().mockImplementation((user, callback) => {
        callback({ _id: userId });
      });
      const getDailyLogSpy = jest
        .fn()
        .mockImplementation((userId, date, success, failure) => {
          success({ _id: dailyLogId });
        });
      const getIntakeSpy = jest
        .fn()
        .mockImplementation((userId, logId, found, notFound) => {
          notFound();
        });
      mongoClient.findUser = findUserSpy;
      mongoClient.getUserIntake = getIntakeSpy;
      mongoClient.getDailyLog = getDailyLogSpy;

      const intakeService = new IntakeService(mongoClient);

      intakeService.getUserIntake(
        userId,
        date,
        successHandlerSpy,
        failHandlerSpy
      );

      expect(failHandlerSpy).toHaveBeenCalled();
      expect(successHandlerSpy).not.toHaveBeenCalled();
      expect(mongoClient.findUser).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(findUserSpy).toHaveBeenCalledWith(userId, expect.any(Function));
      expect(getDailyLogSpy).toHaveBeenCalledWith(
        userId,
        date,
        expect.any(Function),
        expect.any(Function)
      );
      expect(getIntakeSpy).toHaveBeenCalledWith(
        userId,
        dailyLogId,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe("addIntake", () => {
    it("should add intake when user and daily log is present", () => {
      const userId = "someUserId",
        logId = "logId",
        foodId = "foodId";
      const successSpy = jest.fn(),
        failSpy = jest.fn();

      const expected = new Intake("8", userId, logId, foodId, 1);
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((user, callback) => {
        callback({ _id: userId });
      });
      mongoClient.getDailyLog = jest
        .fn()
        .mockImplementation((userId, date, success, failure) => {
          success({ _id: logId });
        });
      mongoClient.insertIntake = jest.fn();
      const intakeService = new IntakeService(mongoClient);

      intakeService.addIntake(
        { foodId: foodId, quantity: 1 },
        successSpy,
        failSpy
      );
      expect(mongoClient.insertIntake).toHaveBeenCalledWith(expected);
      expect(successSpy).toHaveBeenCalled();
    });
  });
});
