import { logError } from "../../util/Logger.js";
import RequestBodyValidator from "../../validators/RequestBodyValidator.js";

class FoodController {
  constructor(foodService) {
    this.foodService = foodService;
    // TODO: stop this
    this.addFood = this.addFood.bind(this);
    this.getFoodOptions = this.getFoodOptions.bind(this);
    this.updateFood = this.updateFood.bind(this);
    this.deleteFood = this.deleteFood.bind(this);
  }

  async addFood(req, res) {
    try {
      if (!RequestBodyValidator.isValidRequestBody(req.body)) {
        res.status(400).send({ message: "Invalid request body." });
      } else {
        await this.foodService.addFood(req.body);
        res.status(201).send({ message: "Food added successfully." });
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
        res.status(204).send();
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

  async updateFood(req, res) {
    try {
      const response = await this.foodService.updateFood(req.body);

      if (response) {
        res.status(204).send();
      } else {
        res.status(400).send();
      }
    } catch (error) {
      logError(error);
      res.status(500).send();
    }
  }

  async deleteFood(req, res) {
    try {
      const response = await this.foodService.deleteFood(req.params.id);

      if (response) {
        res.status(204).send();
      } else {
        res.status(400).send();
      }
    } catch (error) {
      logError(error);
      res.status(500).send();
    }
  }
}

export default FoodController;
