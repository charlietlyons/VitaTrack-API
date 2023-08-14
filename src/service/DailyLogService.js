import MongoClient from "../client/MongoClient.js";
import crypto from "crypto";

class DailyLogService {
  constructor() {
    this.mongoClient = new MongoClient();
  }

  prepareDailyLog(user) {
    this.mongoClient.findUser(user, (result) => {
      if (result) {
        const now = new Date().toJSON().slice(0, 10);
        const dailyLogInitialPayload = {
          _id: crypto.randomUUID(),
          date: now,
          userId: result._id,
          notes: "",
        };

        this.mongoClient.getDailyLog(result._id, now, () =>
          this.mongoClient.insertDailyLog(dailyLogInitialPayload)
        );
      }
    });
  }

  getDailyLog(userId, callback) {
    this.mongoClient.getDailyLog(userId, new Date().toJSON().slice(0, 10), callback);
  }
}

export default DailyLogService;
