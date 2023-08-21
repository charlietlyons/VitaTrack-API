import crypto from "crypto";
import { logError, logEvent } from "../../util/Logger.js";
import DailyLog from "../../data/DailyLog.js";

class DailyLogService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  prepareDailyLog(user, callback) {
    this.mongoClient.getUser(
      user,
      (result) => {
        const today = new Date().toJSON().slice(0, 10);

        const dailyLogInitialPayload = new DailyLog(
          crypto.randomUUID(),
          today,
          result._id,
          ""
        );

        this.mongoClient.getDailyLog(
          result._id,
          today,
          () => {
            logEvent("Daily Log retrieved successfully.");
            callback();
          },
          () => {
            logEvent("Could not retrieve Daily Log. Preparing a new one...");
            this.mongoClient.insertDailyLog(dailyLogInitialPayload);
            callback();
          }
        );
      },
      () => {
        logError("Could not retrieve user.");
        callback();
      }
    );
  }
}

export default DailyLogService;
