import Authenticator from "./Authenticator";
import jwt from "jsonwebtoken";

jest.mock("../util/Logger", () => ({
  logError: jest.fn(),
}));

describe("Authenticator", () => {
  it("should authenticate if auth header has a valid token", async () => {
    const sendSpy = jest.fn();
    const statusSpy = jest.fn().mockReturnValue({ send: sendSpy });
    const req = {
      headers: {
        authorization: "Bearer token",
      },
    };
    const res = {
      status: statusSpy,
    };
    const nextSpy = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation((token, secret, callback) => {
      callback(null, {});
    });

    await Authenticator.authenticate(req, res, nextSpy);

    expect(nextSpy).toHaveBeenCalled();
    expect(statusSpy).not.toHaveBeenCalled();
  });

  it("should return 401 when no token is provided", async () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    const nextSpy = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation((token, secret, callback) => {
      callback(null, {});
    });

    await Authenticator.authenticate(req, res, nextSpy);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("No token");
  });

  it("should return 403 when token is a very bad girl", async () => {
    const req = {
      headers: {
        authorization: "Bearer token",
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    const nextSpy = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation((token, secret, callback) => {
      callback("mr error here", {});
    });

    await Authenticator.authenticate(req, res, nextSpy);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("Invalid token");
  });

  it("should return 403 when error", async () => {
    const error = new Error("mr error here");
    const req = {
      headers: {
        authorization: "Bearer token",
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    const nextSpy = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation((token, secret, callback) => {
      throw error;
    });

    await Authenticator.authenticate(req, res, nextSpy);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith(error);
  });
});
