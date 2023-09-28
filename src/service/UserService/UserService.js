import { logEvent, logError } from "../../util/Logger.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserValidator from "../../validators/UserValidator/UserValidator.js";
import { USER_ROLE } from "../../constants.js";
import crypto from "crypto";
import UserTransformer from "../../transformer/UserTransformer/UserTransformer.js";

dotenv.config();

const HASH_SALT_ROUNDS = process.env.HASH_SALT_ROUNDS;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export default class UserService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
    this.userTransformer = new UserTransformer();
  }

  async createUser(userData) {
    if (!UserValidator.validateRegisterUserPayload(userData)) {
      logError("Invalid user data");
    } else {
      const user = this.userTransformer.transformUserDataToUser(
        userData,
        crypto.randomUUID(),
        USER_ROLE
      );
      const existingUser = await this.mongoClient.getUser(user._email);
      if (!existingUser) {
        await this.registerHandler(user);
        return user;
      }
    }
  }

  async getUserDetails(user) {
    const result = await this.mongoClient.getUser(user);
    if (result) {
      const accountDetails = {
        first: result._firstName,
        last: result._lastName,
        email: result._email,
        phone: result._phone,
      };
      return accountDetails;
    } else {
      throw Error("User does not exist");
    }
  }

  async verifyUser(loginFormData) {
    const result = await this.mongoClient.getUser(loginFormData.email);
    if (result) {
      const token = this.checkPasswordForToken(loginFormData, result);
      return token;
    } else {
      logError("User does not exist");
      return "";
    }
  }

  async verifyToken(token) {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (decoded) {
      return decoded;
    } else {
      throw Error("We were not able to verify the token.");
    }
  }

  // TODO: get rid of this when you have live data
  async deleteAll(res) {
    return await this.mongoClient.deleteAllUsers();
  }

  async checkPasswordForToken(loginFormData, result) {
    return await bcrypt
      .compare(loginFormData.password, result._password)
      .then((match) => {
        if (match) {
          const token = jwt.sign(
            { email: loginFormData.email },
            ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1hr",
            }
          );
          logEvent(`${loginFormData.email} logged in`);
          return token;
        } else {
          logEvent(
            `User attempted to login with incorrect password using email: ${loginFormData.email}`
          );
        }
      });
  }

  async registerHandler(user) {
    return await bcrypt.genSalt(parseInt(HASH_SALT_ROUNDS)).then((salt) => {
      bcrypt.hash(user._password, salt).then(async (hash) => {
        user.salt = salt;
        user._password = hash;
        await this.mongoClient.insertUser(user);
        // TODO: Email Verification
      });
    });
  }
}
