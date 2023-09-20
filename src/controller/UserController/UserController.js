import { logRequest, logError } from "../../util/Logger.js";

export default class UserController {
  constructor(userService, dailyLogService) {
    this.userService = userService;
    this.dailyLogService = dailyLogService;
  }

  createUser = async (req, res) => {
    try {
      const response = await this.userService.createUser(req.body);

      if (response) {
        this.successHandler(req, res, "User created");
      } else {
        this.failHandler(req, res, new Error("Failed to create user.", 500));
      }
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  getUserDetails = (req, res, data) => {
    try {
      this.userService.getUserDetails(
        data.email,
        (result) => this.successHandler(req, res, result),
        (error) => this.failHandler(req, res, error, 403)
      );
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  // TODO: have this return JUST the token and not the whole JS object
  verifyUser = async (req, res) => {
    try {
      const token = await this.userService.verifyUser(req.body);

      this.dailyLogService.prepareDailyLog(req.body.email);
      this.successHandler(req, res, JSON.stringify({ token: token }));
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  verifyToken = (req, res) => {
    try {
      this.userService.verifyToken(
        req.body.token,
        (result) => this.successHandler(result),
        (error) => this.failHandler(req, res, error, 403)
      );
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  deleteAllUsers = (req, res) => {
    this.userService.deleteAll(
      () => res.sendStatus(200),
      () => res.sendStatus(500)
    );
  };

  successHandler = (req, res, payload) => {
    logRequest(req.method, req.url, 200);
    res.send(payload);
  };

  failHandler = (req, res, error, errorCode) => {
    logRequest(req.method, req.url, errorCode);
    logError(error);
    res.status(errorCode).send();
  };
}