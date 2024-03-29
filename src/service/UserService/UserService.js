import { logEvent, logError } from "../../util/Logger.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserValidator from "../../validators/UserValidator/UserValidator.js";
import { USER_ROLE, USER_TABLE } from "../../constants.js";
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

  async registerUser(userData) {
    if (!UserValidator.validateRegisterUserPayload(userData)) {
      logError("Invalid user data");
    } else {
      const user = this.userTransformer.transformUserDataToUser(
        userData,
        crypto.randomUUID(),
        USER_ROLE
      );
      const existingUser = await this.mongoClient.getOneByQuery({
        email: user._email,
      });
      if (!existingUser) {
        await this.registerHandler(user);
        return user;
      }
    }
  }

  async getUserDetails(email) {
    const result = await this.mongoClient.getOneByQuery(USER_TABLE, {
      email: email,
    });
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

  async updateUser(updateBody, email) {
    const { hash, salt } = await this.generatePasswordHashAndSalt(
      updateBody.password
    );
    await this.assignPasswordAndSalt(updateBody, hash, salt);

    const existingUser = await this.mongoClient.getOneByQuery(USER_TABLE, {
      _email: email,
    });

    if (!existingUser) {
      return false;
    } else {
      updateBody._id = existingUser._id;
      const result = await this.mongoClient.update(USER_TABLE, updateBody);

      if (result) {
        return true;
      } else {
        return false;
      }
    }
  }

  async verifyUser(loginFormData) {
    const result = await this.mongoClient.getOneByQuery(USER_TABLE, {
      _email: loginFormData.email,
    });
    if (result) {
      const token = this.verifyPassword(loginFormData, result);
      return token;
    } else {
      logError("User does not exist");
      return null;
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

  async verifyPassword(loginFormData, result) {
    return await bcrypt
      .compare(loginFormData.password, result._password)
      .then((match) => {
        if (match) {
          const token = jwt.sign(
            { email: loginFormData.email, id: result._id },
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

  async generatePasswordHashAndSalt(password) {
    const salt = await bcrypt.genSalt(parseInt(HASH_SALT_ROUNDS));
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  async assignPasswordAndSalt(user, hash, salt) {
    user.salt = await salt;
    user._password = await hash;
    delete user.password;
  }

  async registerHandler(user) {
    const { hash, salt } = this.generatePasswordHashAndSalt(user._password);
    this.assignPasswordAndSalt(user, hash, salt);
    await this.mongoClient.insert(USER_TABLE, user);
    // TODO: Email Verification
  }
}
