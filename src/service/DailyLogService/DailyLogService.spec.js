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
    const insertMock = jest.fn();

    const mongoClient = new MongoClient();
    mongoClient.getUser = jest.fn().mockImplementation((user) => {
      return { _id: "someId" };
    });
    mongoClient.insertDailyLog = insertMock;
    mongoClient.getDailyLog = jest.fn().mockImplementation((id, today) => {
      return {};
    });
    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser");

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("should prepare the daily log if some user exists and daily log for today does not", async () => {
    const insertMock = jest.fn();
    const dailyLogEntity = new DailyLog(
      "8",
      new Date().toJSON().slice(0, 10),
      "someId",
      ""
    );

    const mongoClient = new MongoClient();
    mongoClient.getUser = jest.fn().mockImplementation((user, callback) => {
      return { _id: "someId" };
    });
    mongoClient.getDailyLog = jest.fn().mockImplementation((id, today) => {
      return undefined;
    });
    mongoClient.insertDailyLog = insertMock;

    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser");

    expect(insertMock).toHaveBeenCalledWith(dailyLogEntity);
  });

  it("should do absolutely nothing if no user", async () => {
    const insertMock = jest.fn();

    const mongoClient = new MongoClient();
    mongoClient.getUser = jest.fn().mockImplementation((user) => {
      return null;
    });
    mongoClient.insertDailyLog = insertMock;

    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser");

    expect(insertMock).not.toHaveBeenCalled();
  });
});
