import { logRequest } from "../util/Logger.js";

const healthcheck = (req, res) => {
  logRequest(req.method, req.url);
  res.send("UP");
};

export { healthcheck };