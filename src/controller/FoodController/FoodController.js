import { logError } from "../../util/Logger.js";

class FoodController {
  constructor(foodService) {
    this.foodService = foodService;
    this.addFood = this.addFood.bind(this);
  }

  addFood(req, res) {
    try{
      this.foodService.addFood(req.body);
    } catch(error) {
      logError(error)
    }
    
  }
}

export default FoodController;
