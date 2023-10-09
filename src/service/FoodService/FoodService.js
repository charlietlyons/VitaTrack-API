import { FOOD_TABLE, PRIVATE_ACCESS, PUBLIC_ACCESS } from "../../constants.js";
import Food from "../../data/Food.js";
import crypto from "crypto";

class FoodService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  async addFood(food) {
    const foodEntity = new Food(
      crypto.randomUUID(),
      food.userId,
      food.name,
      food.calories,
      food.protein,
      food.carbs,
      food.fat,
      food.servingSize,
      food.servingUnit,
      food.access === PUBLIC_ACCESS ? PUBLIC_ACCESS : PRIVATE_ACCESS,
      food.description,
      food.imageUrl
    );

    await this.mongoClient.post(FOOD_TABLE, foodEntity);
  }

  async getFoodOptions(userId) {
    const foods = await this.mongoClient.getManyByQuery(FOOD_TABLE, [
      { access: "PUBLIC_ACCESS" },
      { access: "PRIVATE_ACCESS", userId: userId },
    ]);
    return foods;
  }

  async updateFood(foodData) {
    await this.mongoClient.patch(FOOD_TABLE, foodData);
  }

  async deleteFood(foodId) {
    await this.mongoClient.delete(FOOD_TABLE, foodId);
  }
}

export default FoodService;
