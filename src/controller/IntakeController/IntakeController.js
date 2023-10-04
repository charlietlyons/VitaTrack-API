import { INTAKE_TABLE } from "../../constants.js";
import { logError } from "../../util/Logger.js";

export default class IntakeController {
  constructor(intakeService) {
    this.intakeService = intakeService;
    this.addIntake = this.addIntake.bind(this);
    this.getIntake = this.getIntake.bind(this);
    this.deleteIntake = this.deleteIntake.bind(this);
    this.updateIntake = this.updateIntake.bind(this);
  }

  async getIntake(req, res, data) {
    try {
      const result = await this.intakeService.getUserIntake(
        data.email,
        req.query.date
      );
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      logError(error);
      res.status(500).send(error);
    }
  }

  async addIntake(req, res, data) {
    try {
      const result = await this.intakeService.addIntake({
        email: data.email,
        ...req.body,
      });

      if (result) {
        res.status(201).send();
      } else {
        res.status(400).send();
      }
    } catch (error) {
      logError(error);
      res.status(500).send();
    }
  }

  async deleteIntake(req, res, data) {
    try {
      const result = await this.intakeService.deleteIntake(req.params.id);

      if (result) {
        res.status(204).send();
      } else {
        res.status(400).send();
      }
    } catch (error) {
      logError(error);
      res.status(500).send();
    }
  }

  async updateIntake(req, res, data) {
    try {
      const response = await this.intakeService.updateIntake(req.body);

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
