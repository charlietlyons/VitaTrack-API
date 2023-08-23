import UserService from "../../service/UserService/UserService";
import DailyLogService from "../../service/DailyLogService/DailyLogService";
import UserController from "./UserController";
import { logError, logRequest } from "../../util/Logger";

jest.mock("../../util/Logger.js", () => {
  return {
    logRequest: jest.fn(),
    logError: jest.fn(),
  };
});

describe("UserController", () => {
  let userService,
    dailyLogService,
    userController,
    successHandlerSpy,
    failHandlerSpy,
    sendStatusSpy,
    req,
    res;

  beforeEach(() => {
    jest.resetAllMocks();
    userService = jest.mock(UserService.class);
    dailyLogService = jest.mock(DailyLogService.class);
    userController = new UserController(userService, dailyLogService);
    sendStatusSpy = jest.fn();
    statusSpy = jest.fn();
    sendSpy = jest.fn();
    req = {
      method: "SOME",
      url: "someUrl",
      body: { token: "some token" },
    };
    res = {
      sendStatus: sendStatusSpy,
      send: sendSpy,
      status: jest.fn().mockImplementation(() => ({
        send: sendSpy,
      })),
    };
  });

  describe("endpoint logic", () => {
    beforeEach(() => {
      successHandlerSpy = jest.fn();
      failHandlerSpy = jest.fn();
      userController.successHandler = successHandlerSpy;
      userController.failHandler = failHandlerSpy;
    });

    describe("createUser", () => {
      it("should call success handler if user is successfully created", async () => {
        userService.createUser = jest.fn((body, success, failure) =>
          success(req, res, "User created")
        );

        await userController.createUser(req, res);

        expect(successHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          "User created"
        );
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should call failHandler with error on create user failure", async () => {
        userService.createUser = jest.fn((body, success, failure) =>
          failure("some wacky crazy error")
        );

        await userController.createUser(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          "some wacky crazy error",
          500
        );
      });

      it("should call fail handler on error", async () => {
        const bigError = Error("big and crazy error");

        userService.createUser = jest.fn((body, success, failure) => {
          throw bigError;
        });

        await userController.createUser(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(req, res, bigError, 500);
      });
    });

    describe("getUserDetails", () => {
      it("should call success handler if user is successfully retrieved", async () => {
        const result = {
          body: "some crazy body",
        };

        userService.getUserDetails = jest.fn((email, success, failure) =>
          success(result)
        );

        await userController.getUserDetails(req, res, {
          email: "send it to zoom",
        });

        expect(successHandlerSpy).toHaveBeenCalledWith(req, res, result);
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should call fail handler with 403 if user is not retrieved", async () => {
        userService.getUserDetails = jest.fn((email, success, failure) =>
          failure("the kookiest error you've ever seen")
        );

        await userController.getUserDetails(req, res, {
          email: "send it to zoom",
        });

        expect(successHandlerSpy).not.toHaveBeenCalledWith();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          "the kookiest error you've ever seen",
          403
        );
      });

      it("should call fail handler with 500 if user service errors", async () => {
        const error = Error("the kookiest error you've ever seen");

        userService.getUserDetails = jest.fn((email, success, failure) => {
          throw error;
        });

        await userController.getUserDetails(req, res, {
          email: "send it to zoom",
        });

        expect(successHandlerSpy).not.toHaveBeenCalledWith();
        expect(failHandlerSpy).toHaveBeenCalledWith(req, res, error, 500);
      });
    });

    describe("verifyUser", () => {
      it("should call success handler if user is verified and prepare log is successful", async () => {
        userService.verifyUser = jest.fn((body, success, failure) => {
          success("some token");
        });
        dailyLogService.prepareDailyLog = jest.fn((email, success, failure) => {
          success();
        });

        userController.verifyUser(req, res);

        expect(successHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          JSON.stringify({ token: "some token" })
        );
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should send 500 if daily log already exists", async () => {
        userService.verifyUser = jest.fn((body, success, failure) => {
          success("some token");
        });
        dailyLogService.prepareDailyLog = jest.fn((email, success, failure) => {
          failure();
        });

        userController.verifyUser(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          "Log already exists",
          500
        );
      });

      it("should send 403 if user is not found", () => {
        userService.verifyUser = jest.fn((body, success, failure) => {
          failure("errooooooor");
        });

        userController.verifyUser(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          "errooooooor",
          403
        );
      });

      it("should send 500 if user service throws an error", () => {
        const error = Error("errooooooor");
        userService.verifyUser = jest.fn((body, success, failure) => {
          throw error;
        });

        userController.verifyUser(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(req, res, error, 500);
      });
    });

    describe("verifyToken", () => {
      it("should return true if token is valid", async () => {
        userService.verifyToken = jest.fn((token, success, failure) => {
          success(true);
        });

        await userController.verifyToken(req, res);

        expect(successHandlerSpy).toHaveBeenCalled();
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should handle failure with 403 if token is invalid", async () => {
        userService.verifyToken = jest.fn((token, success, failure) => {
          failure("exciting, thrilling error!");
        });

        await userController.verifyToken(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          "exciting, thrilling error!",
          403
        );
      });

      it("should handle failure with 500 if token verification fails", async () => {
        const error = Error("exciting, thrilling error!");

        userService.verifyToken = jest.fn((token, success, failure) => {
          throw Error("exciting, thrilling error!");
        });

        await userController.verifyToken(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(req, res, error, 500);
      });
    });

    describe("deleteAllUsers", () => {
      it("should delete all and return 200", async () => {
        userService.deleteAll = jest.fn((success, failure) => {
          success();
        });

        await userController.deleteAllUsers(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(200);
      });

      it("should not delete all and return 500", async () => {
        userService.deleteAll = jest.fn((success, failure) => {
          failure();
        });

        await userController.deleteAllUsers(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("helper functions", () => {
    describe("successHandler", () => {
      it("should log request and return payload", async () => {
        await userController.successHandler(req, res, "some payload");
        expect(logRequest).toHaveBeenCalledWith("SOME", "someUrl", 200);
        expect(res.send).toHaveBeenCalledWith("some payload");
      });
    });

    describe("failHandler", () => {
      it("should log request and error and send error status", async () => {
        await userController.failHandler(req, res, "some error", 500);
        expect(logRequest).toHaveBeenCalledWith("SOME", "someUrl", 500);
        expect(logError).toHaveBeenCalledWith("some error");
        expect(sendSpy).toHaveBeenCalled();
      });
    });
  });
});
