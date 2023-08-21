import { MongoClient as MongoClientInstance } from "mongodb";
import dotenv from "dotenv";
import { logEvent } from "../../util/Logger.js";

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

  // TODO: Chaining queries?
  insertUser(user) {
    this.client.db(DB_NAME).collection("user").insertOne(user);
    logEvent("User inserted");
  }

  insertDailyLog(dailyLog) {
    this.client.db(DB_NAME).collection("daystat").insertOne(dailyLog);
    logEvent("Daily Log inserted");
  }

  insertIntake(intake) {
    this.client.db(DB_NAME).collection("intake").insertOne(intake);
    logEvent("Intake inserted");
  }

  insertFood(food) {
    this.client.db(DB_NAME).collection("food").insertOne(food);
    logEvent("Food inserted");
  }

  getUserIntake(userId, dayId, foundCallback, notFoundCallback) {
    const query = { dayId: dayId, userId: userId };
    this.client
      .db(DB_NAME)
      .collection("intake")
      .find(query)
      .toArray()
      .then((result) => {
        if (result.length > 0) {
          logEvent("Intake found");
          foundCallback(result);
        } else {
          notFoundCallback();
        }
      });
  }

  getDailyLog(userId, date, foundCallback, notFoundCallback) {
    const query = { userId: userId, date: date };

    this.client
      .db(DB_NAME)
      .collection("daystat")
      .findOne(query)
      .then((result) => {
        if (result) {
          logEvent("Daily log found");
          foundCallback(result);
        } else {
          logEvent("Daily log not found");
          notFoundCallback(result);
        }
      });
  }

  getUser(email, callback) {
    const query = { _email: email };

    this.client
      .db(DB_NAME)
      .collection("user")
      .findOne(query)
      .then((user) => {
        if (user) {
          logEvent("User found");
          callback(user);
        } else {
          logEvent("User not found");
          callback(null);
        }
      });
  }

  deleteAllUsers(callback) {
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