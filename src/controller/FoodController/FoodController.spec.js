import { expect } from "@jest/globals";
import MongoClient from "../../client/MongoClient/MongoClient";
import FoodService from "../../service/FoodService/FoodService";
import FoodController from "./FoodController";
import { logError } from "../../util/Logger";
import RequestBodyValidator from "../../validators/RequestBodyValidator";
import { stat } from "fs";

jest.mock("../../util/Logger.js", () => ({
  logError: jest.fn(),
}));

describe("FoodController", () => {
  let mongoClient;
  let foodService;
  let sendSpy;
  let statusSpy;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    mongoClient = new MongoClient();
    foodService = new FoodService(mongoClient);

    sendSpy = jest.fn();
    statusSpy = jest.fn().mockImplementation((errorCode) => ({
      send: sendSpy,
    }));
    res = {
      send: sendSpy,
      status: statusSpy,
    };
  });

  describe("addFood", () => {
    const payload = {
      name: "gross food",
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 10,
      servingSize: 100,
      servingUnit: "g",
    };

    it("should call food service to add new food", async () => {
      const mockAddFood = jest.fn().mockImplementation((body) => {
        return true;
      });

      foodService.addFood = mockAddFood;

      const foodController = new FoodController(foodService);

      await foodController.addFood({ body: payload }, res);

      expect(mockAddFood).toHaveBeenCalledWith(payload);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "Food added successfully.",
      });
      expect(statusSpy).toBeCalledWith(201);
      expect(logError).not.toHaveBeenCalled();
    });

    it("should return 400 when request body is invalid", async () => {
      const requestValidatorSpy = jest.fn();
      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      const mockAddFood = jest.fn().mockImplementation((body, callback) => {
        callback();
      });

      foodService.addFood = mockAddFood;

      const foodController = new FoodController(foodService);

      foodController.addFood({ body: payload }, res);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "Invalid request body.",
      });
    });

    it("should return 500 when an error is caught in food service", async () => {
      const requestValidatorSpy = jest.fn().mockReturnValue(true);
      const mockAddFood = jest.fn().mockImplementation((body) => {
        throw new Error("hate this food");
      });

      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      foodService.addFood = mockAddFood;

      const foodController = new FoodController(foodService);

      foodController.addFood({ body: payload }, res);

      expect(mockAddFood).toHaveBeenCalledWith(payload);
      expect(foodController).toBeDefined();
      expect(logError).toBeCalled();
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({ message: "hate this food" });
    });

    it("should return Internal Server Error when an error message is not provided", async () => {
      const requestValidatorSpy = jest.fn().mockReturnValue(true);
      const mockAddFood = jest.fn().mockImplementation((body) => {
        throw new Error();
      });

      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      foodService.addFood = mockAddFood;

      const foodController = new FoodController(foodService);

      foodController.addFood({ body: payload }, res);

      expect(mockAddFood).toHaveBeenCalledWith(payload);
      expect(logError).toBeCalled();
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });

    it("should return 500 when an error is caught in request validator", async () => {
      const mockAddFood = jest.fn();
      const requestValidatorSpy = jest.fn().mockImplementation(() => {
        throw new Error("hate this food");
      });

      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      foodService.addFood = mockAddFood;

      const foodController = new FoodController(foodService);

      foodController.addFood({ body: payload }, res);

      expect(mockAddFood).not.toHaveBeenCalled();
      expect(logError).toBeCalled();
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({ message: "hate this food" });
    });
  });

  describe("getFoodOptions", () => {
    it("should return list with foods matching the userId", async () => {
      const requestValidatorSpy = jest.fn().mockReturnValue(true);
      const getFoodOptionsMock = jest.fn().mockImplementation(() => {
        return [{}, {}];
      });

      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      foodService.getFoodOptions = getFoodOptionsMock;

      const foodController = new FoodController(foodService);

      await foodController.getFoodOptions(
        {
          body: {
            userId: "someUserId",
          },
        },
        res
      );

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalledWith([{}, {}]);
    });

    it("should return 204 when no foods match the userId", async () => {
      const getFoodOptionsMock = jest.fn().mockImplementation(() => {
        return [];
      });

      foodService.getFoodOptions = getFoodOptionsMock;

      const foodController = new FoodController(foodService);

      await foodController.getFoodOptions(
        {
          body: {
            userId: "someUserId",
          },
        },
        res
      );

      expect(statusSpy).toHaveBeenCalledWith(204);
      expect(sendSpy).toHaveBeenCalledWith();
    });

    it("should return 400 when request body is invalid", async () => {
      const requestValidatorSpy = jest.fn().mockReturnValue(false);
      const getFoodOptionsMock = jest.fn().mockImplementation(() => {
        return [{}, {}];
      });

      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      foodService.getFoodOptions = getFoodOptionsMock;

      const foodController = new FoodController(foodService);

      await foodController.getFoodOptions(
        {
          body: {
            userId: "someUserId",
          },
        },
        res
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "Invalid request body.",
      });
    });

    it("should log error and send 500 when food service errors", async () => {
      const bigError = new Error("bad tims");

      const getFoodOptionsMock = jest.fn().mockImplementation((userId) => {
        throw bigError;
      });

      foodService.getFoodOptions = getFoodOptionsMock;

      const foodController = new FoodController(foodService);

      foodController.getFoodOptions(
        {
          body: {
            userId: "someUserId",
          },
        },
        res
      );

      expect(logError).toHaveBeenCalledWith(bigError);
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "bad tims",
      });
    });

    it("should log error and send 500 when no error message provided", async () => {
      const bigError = new Error();

      const getFoodOptionsMock = jest.fn().mockImplementation((userId) => {
        throw bigError;
      });

      foodService.getFoodOptions = getFoodOptionsMock;

      const foodController = new FoodController(foodService);

      foodController.getFoodOptions(
        {
          body: {
            userId: "someUserId",
          },
        },
        res
      );

      expect(logError).toHaveBeenCalledWith(bigError);
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });

    it("should log error and send 500 when validator errors", async () => {
      const bigError = new Error("bad tims");

      const requestValidatorSpy = jest.fn().mockImplementation(() => {
        throw bigError;
      });
      const getFoodOptionsMock = jest.fn();

      RequestBodyValidator.isValidRequestBody = requestValidatorSpy;
      foodService.getFoodOptions = getFoodOptionsMock;

      const foodController = new FoodController(foodService);

      foodController.getFoodOptions(
        {
          body: {
            userId: "someUserId",
          },
        },
        res
      );

      expect(logError).toHaveBeenCalledWith(bigError);
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({
        message: "bad tims",
      });
    });
  });

  describe("updateFood", () => {
    it("should send 204 if response is present", async () => {
      foodService.updateFood = jest.fn().mockImplementation(() => {
        return true;
      });

      const foodController = new FoodController(foodService);

      await foodController.updateFood({}, res);

      expect(statusSpy).toHaveBeenCalledWith(204);
      expect(sendSpy).toHaveBeenCalledWith();
    });

    it("should send 400 if response is not present", async () => {
      foodService.updateFood = jest.fn().mockImplementation(() => {
        return false;
      });

      const foodController = new FoodController(foodService);

      await foodController.updateFood({}, res);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith();
    });

    it("should send 500 if errors", async () => {
      foodService.updateFood = jest.fn().mockImplementation(() => {
        throw Error("dumb");
      });

      const foodController = new FoodController(foodService);

      await foodController.updateFood({}, res);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith();
    });
  });
});
