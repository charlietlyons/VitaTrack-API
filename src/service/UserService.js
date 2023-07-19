import MongoClient from "../client/MongoClient.js";
import { logEvent, logError } from "../util/Logger.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserValidator from "../validators/UserValidator.js";
import User from "../data/User.js";
import { USER_ROLE } from "../constants.js";
import crypto from "crypto";

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
        const user = new User(
          crypto.randomUUID(),
          userData.password,
          userData.first,
          userData.last,
          userData.email,
          USER_ROLE
        )

        this.mongoClient.findOne(
          user.email,
          (result) => {
            if (!result) {
              bcrypt.genSalt(parseInt(HASH_SALT_ROUNDS)).then((salt) => {
                bcrypt.hash(user.password, salt).then((hash) => {
                  user.salt = salt;
                  user.password = hash;
                  this.mongoClient.insertOne(user);
                  // TODO: Email Verification
                  successHandler();
                });
              });
            } else {
              failHandler("User already exists");
            }
          },
          (error) => {
            failHandler(error);
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
          bcrypt
            .compare(user.password, result._password)
            .catch((error) => logError(error))
            .then((match) => {
              if (match) {
                const token = jwt.sign(
                  { username: user.user },
                  ACCESS_TOKEN_SECRET,
                  { expiresIn: "1hr" }
                );
                logEvent(`${user.user} logged in`);
                successHandler(token);
              } else {
                failHandler("Password does not match");
              }
            });
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
        logError(error);
        failHandler();
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
}
