import MongoClient from "../client/MongoClient.js";
import { logEvent } from "../util/Logger.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const HASH_SALT_ROUNDS = process.env.HASH_SALT_ROUNDS;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export default class UserService {
  constructor() {
    this.mongoClient = new MongoClient();
  }

  createUser = (user, successHandler, failHandler) => {
    try {
      this.mongoClient.findOne(
        user.user,
        (result) => {
          if (!result) {
            bcrypt.genSalt(parseInt(HASH_SALT_ROUNDS)).then((salt) => {
              bcrypt.hash(user.password, salt).then((hash) => {
                user.password = hash;
                this.mongoClient.insertOne(user);
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
  };

  verifyUser = (user, successHandler, failHandler) => {
    try {
      this.mongoClient.findOne(
        user.user,
        (result) => {
          if (result) {
            bcrypt.compare(user.password, result.password).then((match) => {
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
        },
        (error) => {
          failHandler(error);
        }
      );
    } catch (e) {
      failHandler(e);
    }
  };

  verifyToken = (token, successHandler, failHandler) => {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, data) => {
      if (error) {
        logError(error);
        failHandler();
      } else {
        successHandler(data);
      }
    });
  };
}
