import Food from "../../data/Food.js";
import crypto from "crypto";

class FoodService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  addFood(food, callback) {
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
      food.access,
      food.description,
      food.imageUrl
    );

    this.mongoClient.insertFood(foodEntity);
    callback();
  }

  async getFoodOptions(userId) {
    const foods = await this.mongoClient.getPublicAndPrivateFoodOptions(userId);
    return foods
  }
}

export default FoodService;
