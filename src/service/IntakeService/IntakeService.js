import crypto from "crypto";
import Intake from "../../data/Intake.js";

export default class IntakeService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  async getUserIntake(userId, date) {
    const user = await this.getUserDataOrThrow(userId);
    const dailyLog = await this.getDailyLogDataOrThrow(user._id, date);
    const intakes = await this.getIntakesDataOrThrow(user._id, dailyLog._id);

    const payload = [];
    for (const intake of intakes) {
      // TODO: can this be made into one call
      const foodData = await this.mongoClient.getFoodDataByIntakeId(
        intake.foodId
      );
      payload.push({
        _id: intake._id,
        userId: user._id,
        quantity: intake.quantity,
        name: foodData.name,
        description: foodData.description,
        calories: foodData.calories * intake.quantity,
        protein: foodData.protein * intake.quantity,
        carbs: foodData.carbs * intake.quantity,
        fat: foodData.fat * intake.quantity,
        servingSize: foodData.servingSize,
        servingUnit: foodData.servingUnit,
        imgUrl: foodData.imgUrl,
        access: foodData.access,
      });
    }
    return payload;
  }

  async addIntake(intake) {
    const user = await this.getUserDataOrThrow(intake.email);
    const dailyLog = await this.getDailyLogDataOrThrow(
      user._id,
      new Date().toJSON().slice(0, 10)
    );
    const intakeEntity = new Intake(
      crypto.randomUUID(),
      user._id,
      dailyLog._id,
      intake.foodId,
      intake.quantity
    );
    await this.mongoClient.insertIntake(intakeEntity);
    return intakeEntity;
  }

  async deleteIntake(intakeId) {
    return await this.mongoClient.deleteIntake(intakeId);
  }

  async updateIntake(intakeUpdate) {
    return await this.mongoClient.updateIntake(intakeUpdate);
  }

  async getUserDataOrThrow(userId) {
    const user = await this.mongoClient.getUser(userId);

    if (!user) throw Error(`Could not get user data for userId: ${userId}`);
    return user;
  }

  async getDailyLogDataOrThrow(userId, date) {
    const dailyLog = await this.mongoClient.getDailyLog(userId, date);

    if (!dailyLog)
      throw Error(`Could not get dailyLog for userId: ${userId} on ${date}`);
    return dailyLog;
  }

  async getIntakesDataOrThrow(userId, dayId) {
    const intakes = await this.mongoClient.getUserIntake(userId, dayId);

    if (!intakes)
      throw Error(`Could not get intake data for userId: ${userId}`);
    return intakes;
  }
}
