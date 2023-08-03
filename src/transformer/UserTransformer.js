import User from '../data/User.js';

export function transformUserDataToUser(userData, id, role) {
    return new User(
        id,
        userData.password,
        userData.first,
        userData.last,
        userData.email,
        role
    )
}