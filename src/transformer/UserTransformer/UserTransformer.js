import User from "../../data/User.js";

export default class UserTransformer {
  constructor() {}

  transformUserDataToUser(userData, id, role) {
    return new User(
      id,
      userData.password,
      userData.first,
      userData.last,
      userData.email,
      userData.phone,
      role
    );
  }
}
