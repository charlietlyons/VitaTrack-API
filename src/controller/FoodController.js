import FoodService from "../service/FoodService.js";

class FoodController {
  constructor() {
    this.foodService = new FoodService();
    this.addFood = this.addFood.bind(this);
  }

  addFood(req, res) {
    this.foodService.addFood(req.body);
  }
}

export default FoodController;
