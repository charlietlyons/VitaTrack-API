import MongoClient from "../client/MongoClient.js";
import crypto from "crypto";
import { logError, logEvent } from "../util/Logger.js";

class DailyLogService {
  constructor() {
    this.mongoClient = new MongoClient();
  }

  prepareDailyLog(user, successHandler) {
    this.mongoClient.findUser(user, (result) => {
      const today = new Date().toJSON().slice(0, 10);

      if (result) {
        const dailyLogInitialPayload = new DailyLogService(
          crypto.randomUUID(),
          today,
          result._id,
          "",
        );

        this.mongoClient.getDailyLog(
          result._id,
          today,
          () => {
            logEvent("Daily Log retrieved successfully.");
            successHandler();
          },
          () => {
            logError("Could not retrieve Daily Log. Preparing a new one...");
            this.mongoClient.insertDailyLog(dailyLogInitialPayload);
            successHandler();
          }
        );
      }
    });
  }
}

export default DailyLogService;
