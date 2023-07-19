class User {
  constructor(id, password, firstName, lastName, email, role) {
    this._id = id;
    this._password = password;
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._salt = null;
    this._role = role;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }

  get firstName() {
    return this._firstName;
  }

  set firstName(value) {
    this._firstName = value;
  }

  get lastName() {
    return this._lastName;
  }

  set lastName(value) {
    this._lastName = value;
  }

  get email() {
    return this._email;
  }

  set email(value) {
    this._email = value;
  }

  get salt() {
    return this._salt;
  }

  set salt(value) {
    this._salt = value;
  }

  get role() {
    return this._role;
  }

  set role(value) {
    this._role = value;
  }
}

export default User;
