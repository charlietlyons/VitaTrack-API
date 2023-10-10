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

  getUserDetails = async (req, res, data) => {
    try {
      const result = await this.userService.getUserDetails(data.email);
      if (result) {
        this.successHandler(req, res, result);
      } else {
        this.failHandler(
          req,
          res,
          new Error("Could not retrieve user details."),
          403
        );
      }
    } catch (e) {
      this.failHandler(req, res, e, 500);
    }
  };

  // TODO: have this return JUST the token and not the whole JS object
  verifyUser = async (req, res) => {
    try {
      const token = await this.userService.verifyUser(req.body);
      await this.dailyLogService.prepareDailyLog(req.body.email);
      await this.successHandler(req, res, JSON.stringify({ token: token }));
    } catch (e) {
      await this.failHandler(req, res, e, 500);
    }
  };

  verifyToken = async (req, res) => {
    try {
      const result = await this.userService.verifyToken(
        req.headers.authorization.split(" ")[1]
      );
      if (result) {
        await this.successHandler(req, res, result);
      } else {
        await this.failHandler(req, res, Error("Could not verify token"), 403);
      }
    } catch (e) {
      await this.failHandler(req, res, e, 500);
    }
  };

  deleteAllUsers = async (req, res) => {
    try {
      const result = await this.userService.deleteAll(res);
      if (result) {
        await res.status(200).send();
      } else {
        throw Error("No result from deletion query.");
      }
    } catch (err) {
      logError(err);
      await res.status(500).send();
    }
  };

  successHandler = async (req, res, payload) => {
    logRequest(req.method, req.url, 200);
    await res.send(payload);
  };

  failHandler = async (req, res, error, errorCode) => {
    logRequest(req.method, req.url, errorCode);
    logError(error);
    await res.status(errorCode).send();
  };
}
