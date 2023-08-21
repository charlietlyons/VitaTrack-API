import MongoClient from "../../client/MongoClient/MongoClient.js";
import User from "../../data/User.js";
import { logError, logEvent } from "../../util/Logger.js";
import UserValidator from "../../validators/UserValidator/UserValidator";
import UserService from "./UserService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

jest.mock("crypto", () => {
  return {
    ...jest.requireActual("crypto"),
    randomUUID: () => "8",
  };
});

jest.mock("../../util/Logger.js", () => {
  return {
    logError: jest.fn(),
    logEvent: jest.fn(),
  };
});

describe("UserService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("createUser", () => {
    const userPayload = {
      email: "someEmail",
      password: "somePassword",
      firstName: "someFirstName",
      lastName: "someLastName",
      phone: "somePhone",
    };
    const successSpy = jest.fn(),
      failureSpy = jest.fn();

    it("should fail if payload is incomplete", () => {
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      UserValidator.validateRegisterUserPayload = jest
        .fn()
        .mockReturnValue(false);
      userService.createUser(userPayload, successSpy, failureSpy);

      expect(failureSpy).toHaveBeenCalledWith("Payload incomplete", 400);
    });

    it("should register user if user doesn't exist", () => {
      const registerSpy = jest.fn();
      const mongoClient = new MongoClient();

      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback(false);
      });

      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      userService.createUser(userPayload, successSpy, failureSpy);

      expect(successSpy).toHaveBeenCalled();
      expect(registerSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it("should not register user if user exists", () => {
      const registerSpy = jest.fn();
      const mongoClient = new MongoClient();

      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback(true);
      });

      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      userService.createUser(userPayload, successSpy, failureSpy);

      expect(successSpy).not.toHaveBeenCalled();
      expect(registerSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalledWith("User already exists");
    });

    it("should not register user if error occurs", () => {
      const registerSpy = jest.fn();
      const mongoClient = new MongoClient();
      const error = new Error("the worst thing ever happened");

      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        throw error;
      });

      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      userService.createUser(userPayload, successSpy, failureSpy);

      expect(successSpy).not.toHaveBeenCalled();
      expect(registerSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserDetails", () => {
    it("should return account details if user exists", () => {
      const first = "someFirstName",
        last = "someLastName",
        email = "someEmail",
        phone = "somePhone";
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback(
          new User(
            "someId",
            "somePassword",
            first,
            last,
            email,
            phone,
            "someRole"
          )
        );
      });
      const userService = new UserService(mongoClient);

      userService.getUserDetails(email, successSpy, failureSpy);

      expect(successSpy).toHaveBeenCalledWith({
        first,
        last,
        email,
        phone,
      });
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it("should not return account details if user doesn't exists", () => {
      const email = "someEmail";
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback(null);
      });
      const userService = new UserService(mongoClient);

      userService.getUserDetails(email, successSpy, failureSpy);

      expect(failureSpy).toHaveBeenCalledWith("User does not exist");
      expect(successSpy).not.toHaveBeenCalled();
    });

    it("should not return account details if user doesn't exists", () => {
      const email = "someEmail";
      const error = new Error("the second worst thing ever happened");
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        throw error;
      });
      const userService = new UserService(mongoClient);

      userService.getUserDetails(email, successSpy, failureSpy);

      expect(failureSpy).toHaveBeenCalledWith(error);
      expect(successSpy).not.toHaveBeenCalled();
    });
  });

  describe("verifyUser", () => {
    it("should return token if user exists and password is correct", async () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const token = "someToken";
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback({
          _id: "someId",
          _password: "somePassword",
        });
      });
      const userService = new UserService(mongoClient);
      userService.checkPasswordForToken = jest.fn().mockResolvedValue(token);

      await userService.verifyUser(
        {
          email: "someEmail",
          password: "somePassword",
        },
        successSpy,
        failureSpy
      );

      expect(successSpy).toHaveBeenCalledWith(token);
    });

    it("should not return token if user doesn't exists", async () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const token = "someToken";
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback(null);
      });
      const userService = new UserService(mongoClient);
      await userService.verifyUser(
        {
          email: "someEmail",
          password: "somePassword",
        },
        successSpy,
        failureSpy
      );

      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalledWith("User does not exist");
    });

    it("should not return token if password is incorrect", async () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        callback({
          _id: "someId",
          _password: "somePassword",
        });
      });
      const userService = new UserService(mongoClient);
      userService.checkPasswordForToken = jest.fn().mockResolvedValue(null);
      await userService.verifyUser(
        {
          email: "someEmail",
          password: "somePassword",
        },
        successSpy,
        failureSpy
      );
      expect(successSpy).toHaveBeenCalledWith(null);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it("should fail handle if error thrown", async () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const error = new Error("the third worst thing ever happened");
      const mongoClient = new MongoClient();
      mongoClient.findUser = jest.fn().mockImplementation((email, callback) => {
        throw error;
      });
      const userService = new UserService(mongoClient);
      userService.checkPasswordForToken = jest.fn().mockResolvedValue(null);
      await userService.verifyUser(
        {
          email: "someEmail",
          password: "somePassword",
        },
        successSpy,
        failureSpy
      );
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalledWith(error);
    });
  });

  describe("verifyToken", () => {
    it("should return data if token is valid", () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const data = {
        email: "someEmail",
      };
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      jest
        .spyOn(jwt, "verify")
        .mockImplementation((token, secret, callback) => {
          callback(null, data);
        });

      userService.verifyToken("someToken", successSpy, failureSpy);
      expect(successSpy).toHaveBeenCalledWith(data);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it("should return data if token is valid", () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const error = new Error("big problem with the plumbing");
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      jest
        .spyOn(jwt, "verify")
        .mockImplementation((token, secret, callback) => {
          callback(error, null);
        });

      userService.verifyToken("someToken", successSpy, failureSpy);
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteAll", () => {
    it("should delete all users", () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.deleteAllUsers = jest.fn().mockImplementation((callback) => {
        callback();
      });
      const userService = new UserService(mongoClient);

      userService.deleteAll(successSpy, failureSpy);
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it("should fail if error thrown", async () => {
      const successSpy = jest.fn(),
        failureSpy = jest.fn();
      const error = new Error("the fourth worst thing ever happened");
      const mongoClient = new MongoClient();
      mongoClient.deleteAllUsers = jest.fn().mockImplementation((callback) => {
        throw error;
      });
      const userService = new UserService(mongoClient);

      await userService.deleteAll(successSpy, failureSpy);
      expect(successSpy).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(error);
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe("checkPasswordForToken", () => {
    it("return token if match", async () => {
      const token = "someToken";
      const hashedPassword = "someHashedPassword";
      const loginFormData = {
        email: "someEmail",
        password: "some goofy password",
      };

      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue(token);
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      const result = await userService.checkPasswordForToken(
        loginFormData,
        hashedPassword
      );
      expect(logEvent).toHaveBeenCalledWith(`${loginFormData.email} logged in`);
      expect(result).toBe(token);
    });

    it("return log password attempt if no match", async () => {
      const token = "someToken";
      const hashedPassword = "someHashedPassword";
      const loginFormData = {
        email: "someEmail",
        password: "some goofy password",
      };

      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
      jest.spyOn(jwt, "sign").mockReturnValue(token);
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      const result = await userService.checkPasswordForToken(
        loginFormData,
        hashedPassword
      );

      expect(logEvent).toHaveBeenCalledWith(
        `User attempted to login with incorrect password using email: ${loginFormData.email}`
      );
      expect(result).toBe(undefined);
    });
  });

  describe("registerHandler", () => {
    it("should insert user", async () => {
      const user = new User(
        "someId",
        "somePassword",
        "someFirstName",
        "someLastName",
        "someEmail",
        "somePhone"
      );

      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("someSalt");
      jest.spyOn(bcrypt, "hash").mockResolvedValue("someHash");
      const insertMock = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.insertUser = insertMock;
      const userService = new UserService(mongoClient);

      user.salt = "someSalt";
      user.password = "someHash";

      await userService.registerHandler(user);
      expect(insertMock).toHaveBeenCalledWith(user);
    });
  });
});
