import UserTransformer from "./UserTransformer";
import User from "../../data/User";

describe("UserTransformer", () => {
  describe("transformUserDataToUser", () => {
    it("should transform user request data to user", () => {
      const expected = new User(
        "someId",
        "password",
        "first",
        "last",
        "email",
        "phone",
        "someRole"
      );

      const userTransformer = new UserTransformer();

      const result = userTransformer.transformUserDataToUser(
        {
          password: "password",
          first: "first",
          last: "last",
          email: "email",
          phone: "phone",
        },
        "someId",
        "someRole"
      );

      expect(result).toEqual(expected);
    });
  });
});
