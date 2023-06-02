require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3000;

const app = express();

// Healthcheck
app.get("/health-check", function (req, res) {
  res.send("UP");
});

app.listen(PORT, function () {
  console.log(`Running on port ${PORT}`);
});
