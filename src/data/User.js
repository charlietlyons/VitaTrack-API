class User {
  constructor(id, password, firstName, lastName, email, phone, role) {
    this._id = id;
    this._password = password;
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._phone = phone;
    this._salt = null;
    this._role = role;
  }
}

export default User;
