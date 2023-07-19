class User {
  constructor(id, password, firstName, lastName, email, role) {
    this.id = id;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.salt = null;
    this.role = role;
  }

  get id() {
    return this.id;
  }

  set id(value) {
    this.id = value;
  }

  get password() {
    return this.password;
  }

  set password(value) {
    this.password = value;
  }

  get firstName() {
    return this.firstName;
  }

  set firstName(value) {
    this.firstName = value;
  }

  get lastName() {
    return this.lastName;
  }

  set lastName(value) {
    this.lastName = value;
  }

  get email() {
    return this.email;
  }

  set email(value) {
    this.email = value;
  }

  get salt() {
    return this.salt;
  }

  set salt(value) {
    this.salt = value;
  }

  get role() {
    return this.role;
  }

  set role(value) {
    this.role = value;
  }
}

export default User;
