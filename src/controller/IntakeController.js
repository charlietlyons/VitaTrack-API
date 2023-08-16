import IntakeService from "../service/IntakeService.js";
import { logError } from "../util/Logger.js";

export default class IntakeController {
  constructor() {
    this.intakeService = new IntakeService();
    this.addIntake = this.addIntake.bind(this);
  }

  addIntake(req, res, data) {
    try {
      this.intakeService.addIntake(
        {
          email: data.email,
          ...req.body,
        },
        () => res.status(201).send(),
        () => res.status(400).send()
      );
    } catch (error) {
      logError(error);
      res.status(500).send();
    }
  }
}