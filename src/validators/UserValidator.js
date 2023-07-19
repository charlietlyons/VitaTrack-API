const UserValidator = {
  validateRegisterUserPayload: (user) => {
    // TODO: expand backend validation
    return (
      validateEmail(user.email) ||
      validateFirstName(user.first) ||
      validateLastName(user.last) ||
      validatePassword(user.password) ||
      validatePhone(user.phone)
    );
  },
};

function validateEmail(email) {
  return email !== "";
}

function validateFirstName(first) {
  return first !== "";
}

function validateLastName(last) {
  return last !== "";
}

function validatePassword(password) {
  return password !== "";
}

function validatePhone(phone) {
  return phone !== "";
}

export default UserValidator;
