import { logError } from "../../util/Logger.js";

export default class IntakeController {
  constructor(intakeService) {
    this.intakeService = intakeService;
    this.addIntake = this.addIntake.bind(this);
    this.getIntake = this.getIntake.bind(this);
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
      const result = await this.intakeService.addIntake(
        {
          email: data.email,
          ...req.body,
        })

        if (result) {
          res.status(201).send()
        } else {
          res.status(400).send()
        }
    } catch (error) {
      logError(error);
      res.status(500).send();
    }
  }
}
