import { logRequest } from "../../util/Logger";
import { healthcheck } from "../HealthCheckController/HealthCheckController";

jest.mock("../../util/Logger.js", () => {
  return {
    logRequest: jest.fn(),
  };
});

describe("HealthCheckController", () => {
  it("should log request and send UP if available", () => {
    const sendSpy = jest.fn();

    const req = {
      method: "GERT",
      url: "www.somewhere.com",
    };
    const res = {
      send: sendSpy,
    };

    healthcheck(req, res);

    expect(logRequest).toHaveBeenCalledWith(req.method, req.url);
    expect(sendSpy).toHaveBeenCalledWith("UP");
  });
});
