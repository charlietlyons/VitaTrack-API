export default class Intake {
  constructor(id, userId, dayId, foodId, quantity) {
    this._id = id;
    this.userId = userId;
    this.dayId = dayId;
    this.foodId = foodId;
    this.quantity = quantity;
  }
}
