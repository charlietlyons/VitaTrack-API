import dotenv from "dotenv";
import express from "express";
import routes from "./routes.js";
import { logEvent } from "./util/Logger.js";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT, function () {
  logEvent(`Running on port ${PORT}`);
});

// TODO: change later to only enable CORS for development
if (true) {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(routes);
