import MongoClient from "../client/MongoClient.js";
import { logEvent, logError } from "../util/Logger.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserValidator from "../validators/UserValidator.js";
import { USER_ROLE } from "../constants.js";
import crypto from "crypto";
import { transformUserDataToUser } from "../transformer/UserTransformer.js";

dotenv.config();

const HASH_SALT_ROUNDS = process.env.HASH_SALT_ROUNDS;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export default class UserService {
  constructor() {
    this.mongoClient = new MongoClient();
  }

  createUser = (userData, successHandler, failHandler) => {
    if (UserValidator.validateRegisterUserPayload(userData) == false) {
      failHandler("Payload incomplete", 400);
    } else {
      try {
        const user = transformUserDataToUser(userData, crypto.randomUUID(), USER_ROLE);
        this.mongoClient.findOne(
          user.email,
          (result) => {
            if (!result) {
              this.registerHandler(user);
              successHandler();
            } else {
              failHandler("User already exists");
            }
          }
        );
      } catch (e) {
        failHandler(e);
      }
    }
  };

  verifyUser(user, successHandler, failHandler) {
    try {
      this.mongoClient.findOne(user.email, (result) => {
        if (result) {
          this.checkPasswordForToken(user, result).then((token) => successHandler(token)).catch((error) => failHandler(error));
        } else {
          failHandler("User does not exist");
        }
      });
    } catch (e) {
      failHandler(e);
    }
  }

  verifyToken(token, successHandler, failHandler) {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, data) => {
      if (error) {
        failHandler(error);
      } else {
        successHandler(data);
      }
    });
  }

  // TODO: get rid of this when you have live data
  deleteAll(successHandler, failHandler) {
    try {
      this.mongoClient.deleteAll(successHandler);
    } catch (e) {
      logError(e);
      failHandler();
    }
  }

  checkPasswordForToken(user, result) {
    return bcrypt
      .compare(user.password, result._password)
      .then((match) => {
        if (match) {
          const token = jwt.sign(
            { username: user.user },
            ACCESS_TOKEN_SECRET,
            { expiresIn: "1hr" }
          );
          logEvent(`${user.user} logged in`);
          return token;
        }
      });
  }

  registerHandler(user) {
    bcrypt.genSalt(parseInt(HASH_SALT_ROUNDS)).then((salt) => {
      bcrypt.hash(user.password, salt).then((hash) => {
        user.salt = salt;
        user.password = hash;
        this.mongoClient.insertOne(user);
        // TODO: Email Verification
      });
    });
  }
}
