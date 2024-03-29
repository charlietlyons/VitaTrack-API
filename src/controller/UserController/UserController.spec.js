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
    req,
    res,
    sendSpy,
    statusSpy;

  beforeEach(() => {
    jest.resetAllMocks();
    userService = jest.mock(UserService.class);
    dailyLogService = jest.mock(DailyLogService.class);
    userController = new UserController(userService, dailyLogService);
    sendSpy = jest.fn();
    statusSpy = jest.fn().mockImplementation(() => ({
      send: sendSpy,
    }));
    req = {
      method: "SOME",
      url: "someUrl",
      headers: {
        authorization: "Bearer someToken",
      },
      body: { token: "some token" },
    };
    res = {
      send: sendSpy,
      status: statusSpy,
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
      it("should call create user", async () => {
        const createUserMock = jest.fn((body) => {
          return "some crazy body";
        });

        userService.createUser = createUserMock;

        await userController.createUser(req, res);

        expect(createUserMock).toHaveBeenCalledWith(req.body);
        expect(logError).not.toHaveBeenCalled();
        expect(successHandlerSpy).toHaveBeenCalled();
      });

      it("should call create user", async () => {
        const createUserMock = jest.fn((body) => {
          return null;
        });

        userService.createUser = createUserMock;

        await userController.createUser(req, res);

        expect(createUserMock).toHaveBeenCalledWith(req.body);
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          new Error("Failed to create user.", 500)
        );
      });

      it("should call failHandler with error on create user failure", async () => {
        const bigError = new Error("big and crazy error");

        userService.createUser = jest.fn((body) => {
          throw bigError;
        });

        await userController.createUser(req, res);

        expect(failHandlerSpy).toHaveBeenCalledWith(req, res, bigError, 500);
      });

      it("should call fail handler on error", async () => {
        const bigError = new Error("big and crazy error");

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

        userService.getUserDetails = jest.fn(
          (email, success, failure) => result
        );

        await userController.getUserDetails(req, res, {
          email: "send it to zoom",
        });

        expect(successHandlerSpy).toHaveBeenCalledWith(req, res, result);
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should call fail handler with 403 if user is not retrieved", async () => {
        userService.getUserDetails = jest.fn((email) => null);

        await userController.getUserDetails(req, res, {
          email: "send it to zoom",
        });

        expect(successHandlerSpy).not.toHaveBeenCalledWith();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          Error("Could not retrieve user details."),
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

    describe("sendForgotPasswordEmail", () => {
      it("should be true", () => {
        expect(true).toBe(true);
      });
    });

    describe("updatePassword", () => {
      it("should send 200 if update result is true", async () => {
        userService.updateUser = jest.fn((body) => {
          return true;
        });

        await userController.updatePassword(req, res, { email: "someEmail" });
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(sendSpy).toHaveBeenCalled();
      });

      it("should send 500 if update result is false", async () => {
        userService.updateUser = jest.fn((body) => {
          return false;
        });

        await userController.updatePassword(req, res, { email: "someEmail" });
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(sendSpy).toHaveBeenCalled();
      });

      it("should send 500 if error thrown", async () => {
        userService.updateUser = jest.fn((body) => {
          throw Error("no");
        });

        await userController.updatePassword(req, res);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(sendSpy).toHaveBeenCalled();
      });
    });

    describe("verifyUser", () => {
      it("should return token user is verified and prepare log is successful", async () => {
        userService.verifyUser = jest.fn((body) => {
          return "some token";
        });
        dailyLogService.prepareDailyLog = jest.fn(() => {
          return {};
        });

        await userController.verifyUser(req, res);

        expect(successHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          JSON.stringify({ token: "some token" })
        );
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should send 403 if user is not verified", async () => {
        userService.verifyUser = jest.fn((body) => {
          return null;
        });

        await userController.verifyUser(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          Error("Could not verify user"),
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
        userService.verifyToken = jest.fn((token) => {
          return true;
        });

        await userController.verifyToken(req, res);

        expect(successHandlerSpy).toHaveBeenCalled();
        expect(failHandlerSpy).not.toHaveBeenCalled();
      });

      it("should handle failure with 403 if token is invalid", async () => {
        userService.verifyToken = jest.fn((token) => {
          return null;
        });

        await userController.verifyToken(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          Error("Could not verify token"),
          403
        );
      });

      it("should handle failure with 500 if token verification fails", async () => {
        userService.verifyToken = jest.fn((token) => {
          throw Error("exciting, thrilling error!");
        });

        await userController.verifyToken(req, res);

        expect(successHandlerSpy).not.toHaveBeenCalled();
        expect(failHandlerSpy).toHaveBeenCalledWith(
          req,
          res,
          Error("exciting, thrilling error!"),
          500
        );
      });
    });

    describe("deleteAllUsers", () => {
      it("should return true if deleted", async () => {
        userService.deleteAll = jest.fn((res) => {
          return true;
        });

        await userController.deleteAllUsers(req, res);

        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(sendSpy).toHaveBeenCalled();
      });

      it("should return 500 if no deletions", async () => {
        userService.deleteAll = jest.fn(() => {
          return false;
        });

        await userController.deleteAllUsers(req, res);

        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(sendSpy).toHaveBeenCalled();
      });

      it("should return 500 if no deletions", async () => {
        userService.deleteAll = jest.fn(() => {
          throw Error("big baseballs ruins everything");
        });

        await userController.deleteAllUsers(req, res);

        expect(logError).toHaveBeenCalledWith(
          Error("big baseballs ruins everything")
        );
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(sendSpy).toHaveBeenCalled();
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
