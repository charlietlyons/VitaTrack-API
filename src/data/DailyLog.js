export default class DailyLog {
  constructor(id, date, userId, notes) {
    this._id = id;
    this.date = date;
    this.userId = userId;
    this.notes = notes;
  }
}
