import crypto from "crypto";
import { logError, logEvent } from "../../util/Logger.js";
import DailyLog from "../../data/DailyLog.js";

class DailyLogService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  prepareDailyLog = async (user) => {
    const result = await this.mongoClient.getUser(user);
    const today = new Date().toJSON().slice(0, 10);

    const dailyLogInitialPayload = new DailyLog(
      crypto.randomUUID(),
      today,
      result._id,
      ""
    );

    const existingDailyLog = await this.mongoClient.getDailyLog(result._id, today);

    if (existingDailyLog) {
      return existingDailyLog;
    } else {
      return this.mongoClient.insertDailyLog(dailyLogInitialPayload);
    }
  }
}

export default DailyLogService;
