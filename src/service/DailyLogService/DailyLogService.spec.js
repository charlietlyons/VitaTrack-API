import MongoClient from "../../client/MongoClient/MongoClient";
import DailyLog from "../../data/DailyLog";
import { logError, logEvent } from "../../util/Logger";
import DailyLogService from "./DailyLogService";

jest.mock("crypto", () => {
  return {
    ...jest.requireActual("crypto"),
    randomUUID: () => "8",
  };
});

jest.mock("../../util/Logger.js", () => {
  return {
    logEvent: jest.fn(),
    logError: jest.fn(),
  };
});

describe("DailyLogService", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should not prepare the daily log if some user and a daily log for today exist", async () => {
    const callbackMock = jest.fn();
    const insertMock = jest.fn();

    const mongoClient = new MongoClient();
    mongoClient.getUser = jest.fn().mockImplementation((user, callback) => {
      callback({ _id: "someId" });
    });
    mongoClient.insertDailyLog = insertMock;
    mongoClient.getDailyLog = jest
      .fn()
      .mockImplementation((id, today, successHandler, failureHandler) => {
        successHandler();
      });
    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser", callbackMock);

    expect(logEvent).toHaveBeenCalledWith("Daily Log retrieved successfully.");
    expect(logEvent).not.toHaveBeenCalledWith(
      "Could not retrieve Daily Log. Preparing a new one..."
    );
    expect(insertMock).not.toHaveBeenCalled();
    expect(callbackMock).toHaveBeenCalled();
  });

  it("should prepare the daily log if some user exists and daily log for today does not", async () => {
    const callbackMock = jest.fn();
    const insertMock = jest.fn();
    const dailyLogEntity = new DailyLog(
      "8",
      new Date().toJSON().slice(0, 10),
      "someId",
      ""
    );

    const mongoClient = new MongoClient();
    mongoClient.getUser = jest.fn().mockImplementation((user, callback) => {
      callback({ _id: "someId" });
    });
    mongoClient.getDailyLog = jest
      .fn()
      .mockImplementation((id, today, successHandler, failureHandler) => {
        failureHandler();
      });
    mongoClient.insertDailyLog = insertMock;

    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser", callbackMock);

    expect(logEvent).not.toHaveBeenCalledWith(
      "Daily Log retrieved successfully."
    );
    expect(logEvent).toHaveBeenCalledWith(
      "Could not retrieve Daily Log. Preparing a new one..."
    );
    expect(insertMock).toHaveBeenCalledWith(dailyLogEntity);
    expect(callbackMock).toHaveBeenCalled();
  });

  it("should do absolutely nothing if no user", async () => {
    const callbackMock = jest.fn();
    const insertMock = jest.fn();

    const mongoClient = new MongoClient();
    mongoClient.getUser = jest
      .fn()
      .mockImplementation((user, success, failure) => {
        failure();
      });
    mongoClient.insertDailyLog = insertMock;

    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser", callbackMock);

    expect(logEvent).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith("Could not retrieve user.");
    expect(callbackMock).toHaveBeenCalled();
  });
});
