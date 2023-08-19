import { logEvent } from "../util/Logger.js";
import MongoClient from "./MongoClient/MongoClient";
import { MongoClient as MongoClientInstance } from "mongodb";

jest.mock("../util/Logger.js", () => {
  return {
    logEvent: jest.fn(),
  };
});
jest.mock("mongodb", () => {
  return {
    ...jest.requireActual("mongodb"),
    MongoClient: jest.fn(),
  };
});

describe("MongoClient", () => {
  let mongoClient;

  beforeAll(() => {});

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
  });
  describe("Intake", () => {});
  describe("Food", () => {});
  describe("DailyLog", () => {});
});
