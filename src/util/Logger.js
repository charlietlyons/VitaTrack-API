export function logRequest(method, url, statusCode = 200) {
  console.log(
    `${new Date(Date.now()).toString()} - Request received: ${method} ${url} with status code ${statusCode}`
  );
}

export function logEvent(message) {
  console.log(
    `${new Date(Date.now()).toString()} - Event detected: ${message}`
  );
}

export function logError(message) {
  console.log(
    `${new Date(Date.now()).toString()} - Error detected: ${message}`
  );
}