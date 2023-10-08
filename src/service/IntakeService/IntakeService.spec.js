import MongoClient from "../../client/MongoClient/MongoClient";
import IntakeService from "./IntakeService";
import Intake from "../../data/Intake";
import {
  FOOD_TABLE,
  INTAKE_TABLE,
  DAYSTAT_TABLE,
  USER_TABLE,
} from "../../constants";

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
      userId = "userId";
      dailyLogId = "someDailyLog";
      intakeId = "someIntake";
      date = "someDate";

      jest.resetAllMocks();
    });

    it("should get user intake if user is real, daily log is present, and intake is plentiful", async () => {
      const {
        mongoClient,
        getManyByQueryMock,
        getOneByIdMock,
        getOneByQueryMock,
      } = setupMongoClient();
      const intakeService = new IntakeService(mongoClient);

      await intakeService.getUserIntake(userId, date);
      expect(getOneByIdMock).toHaveBeenCalledWith(USER_TABLE, userId);
      expect(getOneByQueryMock).toHaveBeenCalledWith(DAYSTAT_TABLE, {
        userId: userId,
        date: date,
      });
      expect(getOneByIdMock).toHaveBeenCalledWith(FOOD_TABLE, "foodId");
      expect(getManyByQueryMock).toHaveBeenCalledWith(INTAKE_TABLE, {
        userId: userId,
        dayId: date,
      });
    });

    it("should throw error if user doesn't exist", async () => {
      const {
        mongoClient,
        getManyByQueryMock,
        getOneByIdMock,
        getOneByQueryMock,
      } = setupMongoClient();

      getOneByIdMock.mockReset();
      getManyByQueryMock.mockReset();
      getOneByQueryMock.mockReset();
      getOneByIdMock.mockImplementationOnce((tableName, id) => {
        return null;
      });

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserIntake(userId, date)
      ).rejects.toThrowError("Could not get user data for userId: userId");
      expect(getOneByIdMock).toHaveBeenCalledWith(USER_TABLE, userId);
      expect(getManyByQueryMock).not.toHaveBeenCalled();
    });

    it("should fail handle if daily log doesn't exist", async () => {
      const { mongoClient, getOneByQueryMock } = setupMongoClient();

      getOneByQueryMock.mockReset();
      getOneByQueryMock.mockImplementationOnce((tableName, query) => {
        throw new Error(`throw error`);
      });

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserIntake(userId, date)
      ).rejects.toThrowError(`throw error`);

      expect(getOneByQueryMock).toHaveBeenCalledWith(DAYSTAT_TABLE, {
        userId: userId,
        date: date,
      });
    });

    it("should fail handle if user intake doesn't exist", async () => {
      const { mongoClient, getManyByQueryMock } = setupMongoClient();

      getManyByQueryMock.mockReset();
      getManyByQueryMock.mockImplementationOnce((tableName, query) => {
        throw new Error(`throw error`);
      });

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserIntake(userId, date)
      ).rejects.toThrowError(`throw error`);

      expect(getManyByQueryMock).toHaveBeenCalledWith(INTAKE_TABLE, {
        userId: userId,
        dayId: date,
      });
    });

    describe("deleteIntake", () => {
      it("should return intake", async () => {
        const { mongoClient, deleteMock } = setupMongoClient();
        const intakeService = new IntakeService(mongoClient);

        const result = await intakeService.deleteIntake("someIntakeId");

        expect(result).toBe(true);
        expect(deleteMock).toHaveBeenCalled();
      });
    });

    describe("addIntake", () => {
      it("should add intake when user and daily log is present", async () => {
        const expectedIntake = new Intake(
          "8",
          "userId",
          "someDate",
          "foodId",
          1
        );

        const { mongoClient, postMock } = setupMongoClient();

        const intakeService = new IntakeService(mongoClient);

        const insertedEntity = await intakeService.addIntake({
          foodId: "foodId",
          userId: "userId",
          quantity: 1,
        });

        expect(postMock).toHaveBeenCalledWith(INTAKE_TABLE, expectedIntake);
        expect(insertedEntity).toEqual(expectedIntake);
      });
    });

    describe("updateIntake", () => {
      it("should return true if update successful", async () => {
        const { mongoClient, patchMock } = setupMongoClient();

        const intakeService = new IntakeService(mongoClient);

        const response = await intakeService.updateIntake({ quantity: 3 });

        expect(patchMock).toHaveBeenCalledWith(INTAKE_TABLE, { quantity: 3 });
        expect(response).toBe(true);
      });
    });

    it("should return false if update unsuccessful", async () => {
      const { mongoClient, patchMock } = setupMongoClient();
      patchMock.mockImplementation((user) => {
        return false;
      });

      const intakeService = new IntakeService(mongoClient);

      const response = await intakeService.updateIntake({ quantity: 3 });

      expect(patchMock).toHaveBeenCalledWith(INTAKE_TABLE, { quantity: 3 });
      expect(response).toBe(false);
    });
  });

  describe("getUserDataOrThrow", () => {
    it("should return user if user exists", async () => {
      const { mongoClient, getOneByIdMock } = setupMongoClient();

      const intakeService = new IntakeService(mongoClient);

      const user = await intakeService.getUserDataOrThrow("someUserId");

      expect(user).toEqual({ _id: "someUserId" });
      expect(getOneByIdMock).toHaveBeenCalledWith(USER_TABLE, "someUserId");
    });

    it("should throw error if user doesn't exist", async () => {
      const { mongoClient, getOneByIdMock } = setupMongoClient();
      getOneByIdMock.mockReset();
      getOneByIdMock.mockImplementation((tableName, id) => {
        return null;
      });

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getUserDataOrThrow("someUserId")
      ).rejects.toThrowError("Could not get user data for userId: someUserId");
      expect(getOneByIdMock).toHaveBeenCalledWith(USER_TABLE, "someUserId");
    });
  });

  describe("getDailyLogDataOrThrow", () => {
    it("should return daily log data if it exists", async () => {
      const { mongoClient, getOneByQueryMock } = setupMongoClient();

      getOneByQueryMock.mockReset();
      getOneByQueryMock.mockImplementation((tableName, id) => {
        return { _id: "someId", userId: "someUserId", date: "2022-01-01" };
      });
      const intakeService = new IntakeService(mongoClient);

      const dailyLogData = await intakeService.getDailyLogDataOrThrow(
        "someUserId",
        "2022-01-01"
      );

      expect(dailyLogData).toEqual({
        _id: "someId",
        userId: "someUserId",
        date: "2022-01-01",
      });
      expect(getOneByQueryMock).toHaveBeenCalledWith(DAYSTAT_TABLE, {
        userId: "someUserId",
        date: "2022-01-01",
      });
    });

    it("should throw error if daily log data doesn't exist", async () => {
      const { mongoClient, getOneByQueryMock } = setupMongoClient();
      getOneByQueryMock.mockReset();
      getOneByQueryMock.mockImplementation((tableName, id) => {
        return null;
      });

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getDailyLogDataOrThrow("someUserId", "2022-01-01")
      ).rejects.toThrowError(
        "Could not get dailyLog for userId: someUserId on 2022-01-01"
      );
      expect(getOneByQueryMock).toHaveBeenCalledWith(DAYSTAT_TABLE, {
        userId: "someUserId",
        date: "2022-01-01",
      });
    });
  });

  describe("getIntakesDataOrThrow", () => {
    it("should return intakes data if it exists", async () => {
      const { mongoClient, getManyByQueryMock } = setupMongoClient();

      getManyByQueryMock.mockReset();
      getManyByQueryMock.mockImplementation((tableName, id) => {
        return [{ _id: "intakeId", foodId: "foodId", quantity: 1 }];
      });

      const intakeService = new IntakeService(mongoClient);

      const intakesData = await intakeService.getIntakesDataOrThrow(
        "someUserId",
        "2022-01-01"
      );

      expect(intakesData).toEqual([
        { _id: "intakeId", foodId: "foodId", quantity: 1 },
      ]);
    });

    it("should throw error if intakes data doesn't exist", async () => {
      const { mongoClient, getManyByQueryMock } = setupMongoClient();

      getManyByQueryMock.mockReset();
      getManyByQueryMock.mockImplementation((tableName, id) => {
        return null;
      });

      const intakeService = new IntakeService(mongoClient);

      await expect(
        intakeService.getIntakesDataOrThrow("someUserId", "2022-01-01")
      ).rejects.toThrowError(
        "Could not get intake data for userId: someUserId"
      );
    });
  });

  function setupMongoClient() {
    const mongoClient = new MongoClient();
    const getOneByIdMock = jest
      .fn()
      .mockImplementationOnce((tableName, id) => {
        return { _id: id };
      })
      .mockImplementation((tableName, foodId) => {
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

    const getOneByQueryMock = jest
      .fn()
      .mockImplementationOnce((tableName, query) => {
        return { _id: "someDate" };
      });

    const getManyByQueryMock = jest
      .fn()
      .mockImplementationOnce((tableName, query) => {
        return [{ _id: "intakeId", foodId: "foodId", quantity: 1 }];
      });

    const deleteMock = jest.fn().mockImplementation((tableName, id) => {
      return true;
    });

    const postMock = jest.fn().mockImplementation((tableName, body) => {
      return true;
    });

    const patchMock = jest.fn().mockImplementation((tableName, body) => {
      return true;
    });

    mongoClient.getOneByQuery = getOneByQueryMock;
    mongoClient.getManyByQuery = getManyByQueryMock;
    mongoClient.getOneById = getOneByIdMock;
    mongoClient.delete = deleteMock;
    mongoClient.post = postMock;
    mongoClient.patch = patchMock;

    return {
      mongoClient,
      getManyByQueryMock,
      getOneByIdMock,
      getOneByQueryMock,
      deleteMock,
      postMock,
      patchMock,
    };
  }
});
