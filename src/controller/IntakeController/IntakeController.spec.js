import IntakeController from "./IntakeController";
import { logError } from "../../util/Logger";

jest.mock("../../util/Logger.js", () => ({
  logError: jest.fn(),
}));

describe("IntakeController", () => {
  let intakeService;
  let intakeController;

  beforeEach(() => {
    jest.resetAllMocks();
    intakeService = jest.mock("../../service/IntakeService/IntakeService");
  });

  describe("Get Intake", () => {
    it("should return 200 with intake data when successful", () => {
      const getIntakeMock = jest.fn(
        (req, res, successCallback, errorCallback) => successCallback(200)
      );
      const sendStatusMock = jest.fn();

      intakeService.getUserIntake = getIntakeMock;
      intakeController = new IntakeController(intakeService);

      intakeController.getIntake(
        { query: { date: "2021-01-01" } },
        { send: sendStatusMock },
        { email: "test" }
      );

      expect(getIntakeMock).toHaveBeenCalledWith(
        "test",
        "2021-01-01",
        expect.any(Function),
        expect.any(Function)
      );
      expect(sendStatusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 and log error when intake data is not found in the database", () => {
      const sendStatusMock = jest.fn();
      const getIntakeMock = jest.fn(
        (req, res, successCallback, errorCallback) => errorCallback()
      );

      intakeService.getUserIntake = getIntakeMock;
      intakeController = new IntakeController(intakeService);

      intakeController.getIntake(
        { query: { date: "2021-01-01" } },
        { sendStatus: sendStatusMock },
        { email: "test" }
      );

      expect(getIntakeMock).toHaveBeenCalledWith(
        "test",
        "2021-01-01",
        expect.any(Function),
        expect.any(Function)
      );
      expect(sendStatusMock).toHaveBeenCalledWith(404);
      expect(sendStatusMock).toHaveBeenCalledTimes(1);
    });

    it("should return 500 with intake call is unsuccessful", () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({
        send: sendMock,
      }));
      const getIntakeMock = jest.fn(
        (req, res, successCallback, errorCallback) => {
          throw Error("i hate api calls");
        }
      );

      intakeService.getUserIntake = getIntakeMock;
      intakeController = new IntakeController(intakeService);

      intakeController.getIntake(
        { query: { date: "2021-01-01" } },
        { status: statusMock },
        { email: "test" }
      );

      expect(getIntakeMock).toHaveBeenCalledWith(
        "test",
        "2021-01-01",
        expect.any(Function),
        expect.any(Function)
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Add Intake", () => {
    it("should return 201 when intake data was added successfully", () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({
        send: sendMock,
      }));
      const addIntakeMock = jest.fn((intake, successCallback, errorCallback) =>
        successCallback()
      );

      intakeService.addIntake = addIntakeMock;

      intakeController = new IntakeController(intakeService);
      intakeController.addIntake(
        { body: {} },
        { status: statusMock },
        { email: "test" }
      );

      expect(addIntakeMock).toHaveBeenCalledWith(
        { email: "test", ...{} },
        expect.any(Function),
        expect.any(Function)
      );
      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it("should return 400 when insertion fails", () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({
        send: sendMock,
      }));
      const addIntakeMock = jest.fn((intake, successCallback, errorCallback) =>
        errorCallback()
      );

      intakeService.addIntake = addIntakeMock;

      intakeController = new IntakeController(intakeService);
      intakeController.addIntake(
        { body: {} },
        { status: statusMock },
        { email: "test" }
      );

      expect(addIntakeMock).toHaveBeenCalledWith(
        { email: "test", ...{} },
        expect.any(Function),
        expect.any(Function)
      );
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should return 500 when addIntake method fails", () => {
      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({
        send: sendMock,
      }));
      const addIntakeMock = jest.fn(
        (intake, successCallback, errorCallback) => {
          throw Error("bad api! bad!");
        }
      );

      intakeService.addIntake = addIntakeMock;

      intakeController = new IntakeController(intakeService);
      intakeController.addIntake(
        { body: {} },
        { status: statusMock },
        { email: "test" }
      );

      expect(addIntakeMock).toHaveBeenCalledWith(
        { email: "test", ...{} },
        expect.any(Function),
        expect.any(Function)
      );
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
