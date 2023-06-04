const { logRequest } = require("../util/Logger");

class UserController {
  constructor({ userService }) {
    this.userService = null;
  }

  createUser(req, res) {
    try {
      throw new Error("Not implemented");
      logRequest(req.method, req.url);
      // TODO: Create a user using the userService
      res.send("User created");
    } catch (e) {
      logRequest(req.method, req.url, 500);
      res.status(500).send(e.message);
    }
  }

  verifyUser(req, res) {
    try {
      throw new Error("Not implemented");
      logRequest(req.method, req.url);
      // Verify a user using the userService
      res.send("User verified.");
    } catch (e) {
      logRequest(req.method, req.url, 500);
      res.status(500).send(e.message);
    }
  }
}

module.exports = UserController;
