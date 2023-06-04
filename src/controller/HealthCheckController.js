const healthcheck = (req, res) => {
  console.log("Request received: ${req.method} ${req.url}}");
  res.send("UP");
};

module.exports = { healthcheck };
