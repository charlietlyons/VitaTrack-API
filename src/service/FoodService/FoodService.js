import Food from "../../data/Food.js";
import crypto from "crypto";

class FoodService {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
  }

  addFood(food, callback) {
    const foodEntity = new Food(
      crypto.randomUUID(),
      food.name,
      food.calories,
      food.protein,
      food.carbs,
      food.fat,
      food.servingSize,
      food.servingUnit
    );

    this.mongoClient.insertFood(foodEntity);
    callback();
  }
}

export default FoodService;
