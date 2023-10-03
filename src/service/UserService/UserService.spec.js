import MongoClient from "../../client/MongoClient/MongoClient.js";
import User from "../../data/User.js";
import { logError, logEvent } from "../../util/Logger.js";
import UserValidator from "../../validators/UserValidator/UserValidator";
import UserService from "./UserService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { USER_TABLE } from "../../constants.js";

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
      first: "someFirstName",
      last: "someLastName",
      phone: "somePhone",
    };
    const registerSpy = jest.fn();

    it("should fail if payload is incomplete", async () => {
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      UserValidator.validateRegisterUserPayload = jest
        .fn()
        .mockReturnValue(false);

      userService.registerHandler = registerSpy;
      await userService.createUser(userPayload);

      expect(logError).toHaveBeenCalledWith("Invalid user data");
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("should register user if user doesn't exist", async () => {
      const mongoClient = new MongoClient();
      const expectedUser = new User(
        "8",
        userPayload.password,
        userPayload.first,
        userPayload.last,
        userPayload.email,
        userPayload.phone,
        "user"
      );

      UserValidator.validateRegisterUserPayload = jest
        .fn()
        .mockReturnValue(true);

      mongoClient.getUser = jest.fn().mockImplementation((email) => {
        return false;
      });

      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      const user = await userService.createUser(userPayload);

      expect(user._id).toBe("8");
      expect(logError).not.toHaveBeenCalled();
      expect(registerSpy).toHaveBeenCalledWith(expectedUser);
    });

    it("should not register user if user exists", async () => {
      const registerSpy = jest.fn();
      const mongoClient = new MongoClient();

      mongoClient.getUser = jest.fn().mockImplementation((email) => {
        return true;
      });

      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      await userService.createUser(userPayload);

      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("should not register user if error occurs", async () => {
      const registerSpy = jest.fn();
      const mongoClient = new MongoClient();

      mongoClient.getUser = jest.fn().mockImplementation((email) => {
        return Error("the worst thing ever happened");
      });

      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      await userService.createUser(userPayload);

      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("should return new user entity if existingUser is null", async () => {
      const mongoClient = new MongoClient();
      const expectedEntity = new User(
        "8",
        userPayload.password,
        userPayload.first,
        userPayload.last,
        userPayload.email,
        userPayload.phone,
        "user"
      );

      UserValidator.validateRegisterUserPayload = jest
        .fn()
        .mockReturnValue(true);
      mongoClient.getUser = jest.fn().mockReturnValue(null);
      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      const result = await userService.createUser(userPayload);

      expect(result).toEqual(expectedEntity);
    });

    it("should do nothing if user already exists", async () => {
      const mongoClient = new MongoClient();
      const existingEntity = new User(
        "8",
        userPayload.password,
        userPayload.first,
        userPayload.last,
        userPayload.email,
        userPayload.phone,
        "user"
      );

      UserValidator.validateRegisterUserPayload = jest
        .fn()
        .mockReturnValue(true);
      mongoClient.getUser = jest.fn().mockReturnValue(existingEntity);
      const userService = new UserService(mongoClient);
      userService.registerHandler = registerSpy;

      const result = await userService.createUser(userPayload);

      expect(result).toBeUndefined();
      expect(registerSpy).not.toHaveBeenCalled();
    });
  });

  describe("getUserDetails", () => {
    it("should return account details if user exists", async () => {
      const first = "someFirstName",
        last = "someLastName",
        email = "someEmail",
        phone = "somePhone";

      const mongoClient = new MongoClient();
      mongoClient.getUser = jest.fn().mockImplementation((email) => {
        return new User(
          "someId",
          "somePassword",
          first,
          last,
          email,
          phone,
          "someRole"
        );
      });
      const userService = new UserService(mongoClient);

      const userDetails = await userService.getUserDetails(email);

      expect(userDetails).toEqual({
        first,
        last,
        email,
        phone,
      });
    });

    it("should not return account details if user doesn't exists", async () => {
      const email = "someEmail";

      const mongoClient = new MongoClient();
      mongoClient.getUser = jest.fn().mockImplementation((email) => {
        return null;
      });
      const userService = new UserService(mongoClient);

      await expect(userService.getUserDetails(email)).rejects.toThrowError(
        "User does not exist"
      );
    });
  });

  describe("verifyUser", () => {
    it("should return token if user exists and password is correct", async () => {
      const token = "someToken";
      const mongoClient = new MongoClient();
      mongoClient.getUser = jest.fn().mockImplementation((email) => {
        return {
          _id: "someId",
          _password: "somePassword",
        };
      });
      const userService = new UserService(mongoClient);
      userService.checkPasswordForToken = jest.fn().mockResolvedValue(token);
      const result = await userService.verifyUser({
        email: "someEmail",
        password: "somePassword",
      });
      expect(result).toEqual(token);
    });

    it("should not return token if user doesn't exists", async () => {
      const mongoClient = new MongoClient();
      mongoClient.getUser = jest.fn().mockReturnValue(null);

      const userService = new UserService(mongoClient);
      await userService.verifyUser({
        email: "someEmail",
        password: "somePassword",
      });
      expect(logError).toHaveBeenCalledWith("User does not exist");
    });

    it("should not return token if password is incorrect", async () => {
      const mongoClient = new MongoClient();
      mongoClient.getUser = jest.fn().mockReturnValue({
        _id: "someId",
        _password: "somePassword",
      });
      const userService = new UserService(mongoClient);
      userService.checkPasswordForToken = jest.fn().mockResolvedValue(null);
      const result = await userService.verifyUser({
        email: "someEmail",
        password: "somePassword",
      });
      expect(result).toBeNull();
    });
  });

  describe("verifyToken", () => {
    it("should return data if token is valid", async () => {
      const data = {
        email: "someEmail",
      };
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);

      jest.spyOn(jwt, "verify").mockImplementation((token, secret) => {
        return data;
      });

      const result = await userService.verifyToken("someToken");
      expect(result).toEqual(data);
    });

    it("should throw error if token is invalid", async () => {
      const mongoClient = new MongoClient();
      const userService = new UserService(mongoClient);
      const jwtVerifyMock = jest.fn().mockImplementation((token, secret) => {
        return false;
      });

      jwt.verify = jwtVerifyMock;
      await expect(userService.verifyToken("someToken")).rejects.toThrowError(
        "We were not able to verify the token."
      );
    });
  });

  describe("deleteAll", () => {
    it("should delete all users", async () => {
      const mongoClient = new MongoClient();
      mongoClient.deleteAllUsers = jest.fn().mockImplementation(() => {
        return true;
      });
      const userService = new UserService(mongoClient);

      const result = await userService.deleteAll();

      expect(result).toEqual(true);
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
      const postMock = jest.fn();
      const mongoClient = new MongoClient();
      mongoClient.post = postMock;
      const userService = new UserService(mongoClient);

      user.salt = "someSalt";
      user.password = "someHash";

      await userService.registerHandler(user);
      expect(postMock).toHaveBeenCalledWith(USER_TABLE, user);
    });
  });
});
