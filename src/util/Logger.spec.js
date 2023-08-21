import { logRequest, logError, logEvent } from "./Logger";

describe("Logger", () => {
  it("should log request", () => {
    const logMock = jest.fn();

    console.log = logMock;

    logRequest("uh");

    expect(console.log).toHaveBeenCalledWith(
      `${new Date(
        Date.now()
      ).toString()} - Request received: uh undefined with status code 200`
    );
  });

  it("should log error", () => {
    const logMock = jest.fn();

    console.log = logMock;

    logError("uh");

    expect(console.log).toHaveBeenCalledWith(
      `${new Date(Date.now()).toString()} - Error detected: uh`
    );
  });

  it("should log event", () => {
    const logMock = jest.fn();

    console.log = logMock;

    logEvent("uh");

    expect(console.log).toHaveBeenCalledWith(
      `${new Date(Date.now()).toString()} - Event detected: uh`
    );
  });
});
