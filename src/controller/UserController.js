import UserService from "../service/UserService.js";
import { logRequest, logError } from "../util/Logger.js";

export default class UserController {
  constructor() {
    this.userService = new UserService();
  }

  createUser = (req, res) => {
    try {
      this.userService.createUser(
        req.body,
        () => {
          logRequest(req.method, req.url, 200);
          res.send("User created");
        },
        (error) => {
          logError(error);
          logRequest(req.method, req.url, 500);
          res.status(500).send();
        }
      );
    } catch (e) {
      logRequest(req.method, req.url, 500);
      res.status(500).send(e.message);
    }
  };

  verifyUser = (req, res) => {
    try {
      logRequest(req.method, req.url);
      this.userService.verifyUser(
        req.body,
        (token) => {
          logRequest(req.method, req.url, 200);
          res.send(JSON.stringify({ token: token }));
        },
        (error) => {
          logError(error);
          logRequest(req.method, req.url, 500);
          res.status(500).send();
        }
      );
    } catch (e) {
      logRequest(req.method, req.url, 500);
      res.status(500).send(e.message);
    }
  };

  verifyToken = (req, res) => {
    this.userService.verifyToken(
      req.body.token,
      (result) => {
        res.send(result);
      },
      (error) => {
        logError(error);
        res.sendStatus(403);
      }
    );
  };
}
