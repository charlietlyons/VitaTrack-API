import jwt from "jsonwebtoken";
import { logError } from "../util/Logger";
import dotenv from "dotenv";

dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const Authenticator = {
  authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logError("No token");
      return res.status(401).send("No token");
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, ACCESS_TOKEN_SECRET, (error, data) => {
        if (error) {
          logError(error);
          return res.status(403).send("Invalid token");
        } else {
          next(req, res, data);
        }
      });
    } catch (error) {
      logError("Invalid token");
      return res.status(403).send(error);
    }
  },
};

export default Authenticator;
