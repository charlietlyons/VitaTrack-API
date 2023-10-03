import crypto from "crypto";
import DailyLog from "../../data/DailyLog.js";
import { DAYSTAT_TABLE, USER_TABLE } from "../../constants.js";

class DailyLogService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  prepareDailyLog = async (user) => {
    const result = await this.mongoClient.getOneByQuery(USER_TABLE, {
      email: user.email,
    });
    if (result) {
      const today = new Date().toJSON().slice(0, 10);

      const dailyLogInitialPayload = new DailyLog(
        crypto.randomUUID(),
        today,
        result._id,
        ""
      );

      const existingDailyLog = await this.mongoClient.getManyByQuery(
        DAYSTAT_TABLE,
        {
          userId: result._id,
          date: today,
        }
      );

      if (existingDailyLog) {
        return existingDailyLog;
      } else {
        return this.mongoClient.post(DAYSTAT_TABLE, dailyLogInitialPayload);
      }
    }
  };
}

export default DailyLogService;
