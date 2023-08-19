import UserService from "../service/UserService.js";
import DailyLogService from "../service/DailyLogService.js";
import { logRequest, logError } from "../util/Logger.js";

export default class UserController {
  constructor(userService, dailyLogService) {
    this.userService = userService;
    this.dailyLogService = dailyLogService;
  }

  createUser = (req, res) => {
    try {
      this.userService.createUser(
        req.body,
        () => this.successHandler(req, res, "User created"),
        (error) => this.failHandler(req, res, error, 500)
      );
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
  verifyUser = (req, res) => {
    try {
      this.userService.verifyUser(
        req.body,
        (token) => {
          this.dailyLogService.prepareDailyLog(
            req.body.email,
            () => {
              this.successHandler(req, res, JSON.stringify({ token: token }));
            },
            () => res.sendStatus(500)
          );
        },
        (error) => this.failHandler(req, res, error, 403)
      );
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  verifyToken = (req, res) => {
    try {
      this.userService.verifyToken(
        req.body.token,
        (result) => res.send(result),
        (error) => this.failHandler(req, res, error, 403)
      );
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  deleteAll = (req, res) => {
    this.userService.deleteAll(
      () => res.sendStatus(200),
      () => res.sendStatus(500)
    );
  };

  successHandler = (req, res, payload = {}) => {
    logRequest(req.method, req.url, 200);
    res.send(payload);
  };

  failHandler = (req, res, error, errorCode) => {
    logRequest(req.method, req.url, errorCode);
    logError(error);
    res.status(errorCode).send();
  };
}
