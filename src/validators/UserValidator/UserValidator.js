const UserValidator = {
  validateRegisterUserPayload: (user) => {
    // TODO: expand backend validation
    return (
      validateEmail(user.email) &&
      validateFirstName(user.first) &&
      validateLastName(user.last) &&
      validatePassword(user.password) &&
      validatePhone(user.phone)
    );
  },
};

export function validateEmail(email) {
  return email !== "";
}

export function validateFirstName(first) {
  return first !== "";
}

export function validateLastName(last) {
  return last !== "";
}

export function validatePassword(password) {
  return password !== "";
}

export function validatePhone(phone) {
  return phone !== "";
}

export default UserValidator;
