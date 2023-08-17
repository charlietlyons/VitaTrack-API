import MongoClient from "../client/MongoClient.js";
import crypto from "crypto";

export default class IntakeService {
  constructor() {
    this.mongoClient = new MongoClient();
  }

  getUserIntake(userId, date, successHandler, failHandler) {
    this.mongoClient.findUser(userId, (user) => {
      if (user) {
        this.mongoClient.getDailyLog(
          user._id,
          date,
          (dailyLog) => {
            if (dailyLog) {
              this.mongoClient.getUserIntake(user._id, dailyLog._id, (result) => {
                // TODO: pull food data from DB
                const payload = []

                result.forEach((intake) => {
                  payload.push({
                    _id: intake._id,
                    userId: user._id,
                    quantity: intake.quantity,
                    name: "Banana",
                    description: "A banana",
                    calories: 100,
                    protein: 10,
                    carbs: 10,
                    fat: 10,
                    servingSize: 100,
                    serving_unit: "g",
                    imgUrl: "",
                    userId: "admin",
                    isCustom: true,
                    isPrivate: false
                  });
                });
                successHandler(payload);
              }, failHandler)
            } else {
              failHandler();
            }
          },
          failHandler
        );
      } else {
        failHandler();
      }
    });
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
