import MongoClient from "../../client/MongoClient/MongoClient";
import { DAYSTAT_TABLE } from "../../constants";
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
    const postMock = jest.fn();

    const mongoClient = new MongoClient();
    mongoClient.getManyByQuery = jest.fn().mockImplementation((user) => {
      return { _id: "someId" };
    });
    mongoClient.post = postMock;
    mongoClient.getManyByQuery = jest.fn().mockImplementation((id, today) => {
      return {};
    });
    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser");

    expect(postMock).not.toHaveBeenCalled();
  });

  it("should prepare the daily log if some user exists and daily log for today does not", async () => {
    const postMock = jest.fn();
    const dailyLogEntity = new DailyLog(
      "8",
      new Date().toJSON().slice(0, 10),
      "someId",
      ""
    );

    const mongoClient = new MongoClient();
    mongoClient.getOneByQuery = jest.fn().mockImplementation(() => {
      return {
        _id: "someId",
      };
    });
    mongoClient.getManyByQuery = jest
      .fn()
      .mockImplementation((tableName, query) => {
        return { _id: "someId" };
      });
    mongoClient.getManyByQuery = jest.fn().mockImplementation((id, today) => {
      return undefined;
    });
    mongoClient.post = postMock;

    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser");

    expect(postMock).toHaveBeenCalledWith(DAYSTAT_TABLE, dailyLogEntity);
  });

  it("should do absolutely nothing if no user", async () => {
    const postMock = jest.fn();

    const mongoClient = new MongoClient();
    mongoClient.getOneByQuery = jest.fn().mockImplementation((user) => {
      return false;
    });
    mongoClient.post = postMock;

    const dailyLogService = new DailyLogService(mongoClient);
    await dailyLogService.prepareDailyLog("someUser");

    expect(postMock).not.toHaveBeenCalled();
  });
});
