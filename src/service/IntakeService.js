import crypto from "crypto";
import Intake from "../data/Intake.js";

export default class IntakeService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  getUserIntake(userId, date, successHandler, failHandler) {
    this.mongoClient.findUser(userId, (user) => {
      if (user) {
        this.mongoClient.getDailyLog(
          user._id,
          date,
          (dailyLog) => {
            if (dailyLog) {
              this.mongoClient.getUserIntake(
                user._id,
                dailyLog._id,
                (result) => {
                  // TODO: pull food data from DB
                  const payload = [];

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
                      isPrivate: false,
                    });
                  });
                  successHandler(payload);
                },
                failHandler
              );
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
    this.mongoClient.findUser(intake.email, (user) => {
      if (user) {
        this.mongoClient.getDailyLog(
          user._id,
          new Date().toJSON().slice(0, 10),
          (dailyLog) => {
            if (dailyLog) {
              const intakeEntity = new Intake(
                crypto.randomUUID(),
                user._id,
                dailyLog._id,
                intake.foodId,
                intake.quantity
              );
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
