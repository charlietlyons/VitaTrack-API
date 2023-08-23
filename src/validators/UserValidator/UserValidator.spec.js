import UserValidator, {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
} from "./UserValidator";

describe("UserValidator", () => {
  describe("validateRegisterUserPayload", () => {
    it("should return true if all fields are present", () => {
      const result = UserValidator.validateRegisterUserPayload({
        email: "email",
        password: "password",
        first: "first",
        last: "last",
        phone: "phone",
      });

      expect(result).toEqual(true);
    });

    it("should return false if any field is not present", () => {
      const payload = {
        email: "email",
        password: "password",
        first: "first",
        last: "last",
        phone: "phone",
      };

      for (const key in payload) {
        payload[key] = "";
        const result = UserValidator.validateRegisterUserPayload(payload);
        expect(result).toEqual(false);
        payload[key] = "someValue";
      }
    });
  });

  describe("validateEmail", () => {
    it("should return true if email is not empty", () => {
      const result = validateEmail("email");
      expect(result).toEqual(true);
    });

    it("should return false if email is empty", () => {
      const result = validateEmail("");
      expect(result).toEqual(false);
    });
  });

  describe("validateFirstName", () => {
    it("should return true if first is not empty", () => {
      const result = validateFirstName("first");
      expect(result).toEqual(true);
    });

    it("should return false if first is empty", () => {
      const result = validateFirstName("");
      expect(result).toEqual(false);
    });
  });

  describe("validateLastName", () => {
    it("should return true if last is not empty", () => {
      const result = validateLastName("last");
      expect(result).toEqual(true);
    });

    it("should return false if last is empty", () => {
      const result = validateLastName("");
      expect(result).toEqual(false);
    });
  });

  describe("validatePassword", () => {
    it("should return true if password is not empty", () => {
      const result = validatePassword("password");
      expect(result).toEqual(true);
    });

    it("should return false if password is empty", () => {
      const result = validatePassword("");
      expect(result).toEqual(false);
    });
  });

  describe("validatePhone", () => {
    it("should return true if phone is not empty", () => {
      const result = validatePhone("phone");
      expect(result).toEqual(true);
    });

    it("should return false if phone is empty", () => {
      const result = validatePhone("");
      expect(result).toEqual(false);
    });
  });
});
