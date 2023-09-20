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

  async insertUser(user) {
    await this.client.db(DB_NAME).collection("user").insertOne(user);
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

  async insertFood(food) {
    await this.client.db(DB_NAME).collection("food").insertOne(food);
    logEvent("Food inserted");
  }

  async getPublicAndPrivateFoodOptions(userId) {
    const query = {
      $or: [{ access: "PUBLIC_ACCESS" }, { access: "PRIVATE_ACCESS", userId: userId }],
    };

    const foods = await this.client
      .db(DB_NAME)
      .collection("food")
      .find(query)
      .toArray();
    return foods;
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

  async getDailyLog(userId, date) {
    const query = { userId: userId, date: date };

    const result = await this.client
      .db(DB_NAME)
      .collection("daystat")
      .findOne(query);

    if (result) {
      logEvent("Daily log found");
    } else {
      logEvent("Daily log not found");
    }

    return result;
  }

  async getUser(email) {
    const query = { _email: email };

    const db = this.client.db(DB_NAME).collection("user");

    const user = await db.findOne(query);
    return user;
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
