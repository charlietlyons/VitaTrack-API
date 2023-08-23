import { logError } from "../../util/Logger.js";

export default class IntakeController {
  constructor(intakeService) {
    this.intakeService = intakeService;
    this.addIntake = this.addIntake.bind(this);
    this.getIntake = this.getIntake.bind(this);
  }

  getIntake(req, res, data) {
    try {
      this.intakeService.getUserIntake(data.email, req.query.date, (result) => res.send(result), () => res.sendStatus(404));
    } catch (error) {
      logError(error);
      res.status(500).send(error);
    }
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
