require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3000;

const app = express();
const routes = require("./routes");

app.listen(PORT, function () {
  console.log(`Running on port ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(routes);