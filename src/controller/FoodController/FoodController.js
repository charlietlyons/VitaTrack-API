import { logError } from "../../util/Logger.js";

class FoodController {
  constructor(foodService) {
    this.foodService = foodService;
    this.addFood = this.addFood.bind(this);
  }

  addFood(req, res) {
    try {
      this.foodService.addFood(req.body, () => {
        res.send();
      });
    } catch (error) {
      logError(error);
      res.send(500);
    }
  }
}

export default FoodController;
