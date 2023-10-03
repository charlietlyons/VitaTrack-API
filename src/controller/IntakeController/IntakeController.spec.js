import IntakeController from "./IntakeController";
import { logError } from "../../util/Logger";

jest.mock("../../util/Logger.js", () => ({
  logError: jest.fn(),
}));

describe("IntakeController", () => {
  let intakeService;
  let intakeController;
  let sendSpy;
  let statusSpy;

  beforeEach(() => {
    jest.resetAllMocks();
    intakeService = jest.mock("../../service/IntakeService/IntakeService");
    sendSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({
      send: sendSpy,
    });
  });

  describe("Get Intake", () => {
    it("should return 200 with intake data when successful", async () => {
      const getIntakeMock = jest.fn((req, res) => 200);

      intakeService.getUserIntake = getIntakeMock;
      intakeController = new IntakeController(intakeService);

      await intakeController.getIntake(
        { query: { date: "2021-01-01" } },
        { status: statusSpy },
        { email: "test" }
      );

      expect(getIntakeMock).toHaveBeenCalledWith("test", "2021-01-01");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalled();
    });

    it("should return 404 and log error when intake data is not found in the database", async () => {
      const getIntakeMock = jest.fn((req, res) => null);

      intakeService.getUserIntake = getIntakeMock;
      intakeController = new IntakeController(intakeService);

      await intakeController.getIntake(
        { query: { date: "2021-01-01" } },
        { status: statusSpy },
        { email: "test" }
      );

      expect(getIntakeMock).toHaveBeenCalledWith("test", "2021-01-01");
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(sendSpy).toHaveBeenCalled();
    });

    it("should return 500 with intake call is unsuccessful", async () => {
      const getIntakeMock = jest.fn().mockImplementation(async (req, res) => {
        throw Error("i hate api calls");
      });

      intakeService.getUserIntake = getIntakeMock;
      intakeController = new IntakeController(intakeService);

      await intakeController.getIntake(
        { query: { date: "2021-01-01" } },
        { status: statusSpy },
        { email: "test" }
      );

      expect(getIntakeMock).toHaveBeenCalledWith("test", "2021-01-01");
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Add Intake", () => {
    it("should return 201 when intake data was added successfully", async () => {
      const addIntakeMock = jest.fn((intake) => true);

      intakeService.addIntake = addIntakeMock;

      intakeController = new IntakeController(intakeService);
      await intakeController.addIntake(
        { body: {} },
        { status: statusSpy },
        { email: "test" }
      );

      expect(addIntakeMock).toHaveBeenCalledWith({ email: "test", ...{} });
      expect(statusSpy).toHaveBeenCalledWith(201);
    });

    it("should return 400 when insertion fails", async () => {
      const addIntakeMock = jest.fn((intake) => null);

      intakeService.addIntake = addIntakeMock;

      intakeController = new IntakeController(intakeService);
      await intakeController.addIntake(
        { body: {} },
        { status: statusSpy },
        { email: "test" }
      );

      expect(addIntakeMock).toHaveBeenCalledWith({ email: "test", ...{} });
      expect(statusSpy).toHaveBeenCalledWith(400);
    });

    it("should return 500 when addIntake method fails", async () => {
      const addIntakeMock = jest.fn((intake) => {
        throw Error("bad api! bad!");
      });

      intakeService.addIntake = addIntakeMock;

      intakeController = new IntakeController(intakeService);
      await intakeController.addIntake(
        { body: {} },
        { status: statusSpy },
        { email: "test" }
      );

      expect(addIntakeMock).toHaveBeenCalledWith({ email: "test", ...{} });
      expect(statusSpy).toHaveBeenCalledWith(500);
    });
  });

  describe("Delete Intake", () => {
    it("should return 204 if delete successful", async () => {
      const deleteIntakeMock = jest.fn((intake) => true);

      intakeService.deleteIntake = deleteIntakeMock;

      intakeController = new IntakeController(intakeService);
      await intakeController.deleteIntake(
        { params: { id: "someId" } },
        { status: statusSpy }
      );

      expect(deleteIntakeMock).toHaveBeenCalledWith("someId");
      expect(statusSpy).toHaveBeenCalledWith(204);
    });

    it("should return 400 if delete unsuccessful", async () => {
      const deleteIntakeMock = jest.fn((intake) => false);

      intakeService.deleteIntake = deleteIntakeMock;

      intakeController = new IntakeController(intakeService);
      await intakeController.deleteIntake(
        { params: { id: "someId" } },
        { status: statusSpy }
      );

      expect(deleteIntakeMock).toHaveBeenCalledWith("someId");
      expect(statusSpy).toHaveBeenCalledWith(400);
    });

    it("should return 500 if error", async () => {
      const deleteIntakeMock = jest.fn((intake) => {
        throw Error("bad times");
      });

      intakeService.deleteIntake = deleteIntakeMock;

      intakeController = new IntakeController(intakeService);
      await intakeController.deleteIntake(
        { params: { id: "someId" } },
        { status: statusSpy }
      );

      expect(deleteIntakeMock).toHaveBeenCalledWith("someId");
      expect(statusSpy).toHaveBeenCalledWith(500);
    });
  });

  describe("Update Intake", () => {
    it("should return 204 if update was a success", async () => {
      intakeService.updateIntake = jest.fn().mockImplementation(() => {
        return true;
      });

      await intakeController.updateIntake(
        { query: { quantity: 2 } },
        { status: statusSpy },
        {}
      );

      expect(statusSpy).toHaveBeenCalledWith(204);
      expect(sendSpy).toHaveBeenCalled();
    });

    it("should return 400 if update was unsuccessful", async () => {
      intakeService.updateIntake = jest.fn().mockImplementation(() => {
        return false;
      });

      await intakeController.updateIntake(
        { query: { quantity: 2 } },
        { status: statusSpy },
        {}
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalled();
    });

    it("should return 500 if an error occurred during update", async () => {
      intakeService.updateIntake = jest.fn().mockImplementation(() => {
        throw Error("");
      });

      await intakeController.updateIntake(
        { query: { quantity: 2 } },
        { status: statusSpy },
        {}
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalled();
    });
  });
});
