import { logError } from "../../util/Logger.js";
import RequestBodyValidator from "../../validators/RequestBodyValidator.js";

class FoodController {
  constructor(foodService) {
    this.foodService = foodService;
    this.addFood = this.addFood.bind(this);
    this.getFoodOptions = this.getFoodOptions.bind(this);
  }

  addFood(req, res) {
    try {
      if (!RequestBodyValidator.isValidRequestBody(req.body)) {
        res.status(400).send({ message: "Invalid request body." });
      } else {
        this.foodService.addFood(req.body, () => {
          res.status(201).send({ message: "Food added successfully." });
        });
      }
    } catch (error) {
      logError(error);
      res
        .status(500)
        .send({ message: error.message || "Internal Server Error" });
    }
  }

  async getFoodOptions(req, res) {
    try {
      if (!RequestBodyValidator.isValidRequestBody(req.body)) {
        res.status(400).send({ message: "Invalid request body." });
      }
      const data = await this.foodService.getFoodOptions(req.body.userId);
      if (data.length === 0) {
        res.status(204).send(data);
      } else {
        res.status(200).send(data);
      }
    } catch (error) {
      logError(error);
      res
        .status(500)
        .send({ message: error.message || "Internal Server Error" });
    }
  }
}

export default FoodController;
