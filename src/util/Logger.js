function logRequest(method, url, statusCode = 200) {
  console.log(
    `${new Date(Date.now()).toString()} - Request received: ${method} ${url} with status code ${statusCode}`
  );
}

module.exports = { logRequest };
