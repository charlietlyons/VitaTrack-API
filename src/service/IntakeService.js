import MongoClient from "../client/MongoClient.js";
import crypto from "crypto";

export default class IntakeService {
  constructor() {
    this.mongoClient = new MongoClient();
  }

  addIntake(intake, successHandler, failHandler) {
    this.mongoClient.findUser(intake.email, (result) => {
      if (result) {
        this.mongoClient.getDailyLog(
          result._id,
          new Date().toJSON().slice(0, 10),
          (dailyLog) => {
            if (dailyLog) {
              const intakeEntity = {
                _id: crypto.randomUUID(),
                userId: result._id,
                dayId: dailyLog._id,
                foodId: intake.foodId,
                quantity: intake.quantity,
              };
              this.mongoClient.insertIntake(intakeEntity);
              successHandler();
            } else {
              failHandler();
            }
          },
          failHandler
        );
      }
    });
  }
}
