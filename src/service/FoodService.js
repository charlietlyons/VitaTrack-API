import MongoClient from "../client/MongoClient.js";
import Food from "../data/Food.js";

class FoodService {
  constructor() {
    this.client = new MongoClient();
  }

  addFood(food) {
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

    this.client.insertFood(foodEntity);
  }
}

export default FoodService;
