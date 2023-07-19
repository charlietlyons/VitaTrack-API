import { MongoClient as MongoClientInstance } from "mongodb";
import dotenv from "dotenv";
import { logEvent, logError } from "../util/Logger.js";

dotenv.config();

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.4fcf2.mongodb.net/?retryWrites=true&w=majority`;

export default class MongoClient {
  constructor() {
    this.client = new MongoClientInstance(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  insertOne(user) {
    this.client.db(DB_NAME).collection("user").insertOne(user);
    logEvent("User inserted");
  }

  findOne(username, callback) {
    const query = { user: username };
    const options = {
      projection: { _id: 0 },
    };

    this.client
      .db(DB_NAME)
      .collection("user")
      .findOne(query, options)
      .then((user) => {
        if (user) {
          logEvent("User found");
          callback(user);
        } else {
          logEvent("User not found");
          callback(null);
        }
      })
      .catch((error) => {
        logError(error);
      });
  }

  deleteAll(callback) {
    this.client
      .db(DB_NAME)
      .collection("user")
      .deleteMany({})
      .then((result) => {
        logEvent(
          "User database reset. " + result.deletedCount + " entries deleted."
        );
        callback();
      });
  }
}
