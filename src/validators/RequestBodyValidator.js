const RequestBodyValidator = {
  isValidRequestBody: (body) => {
    return body && typeof body === "object" && !Array.isArray(body);
  },
};

export default RequestBodyValidator;