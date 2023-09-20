export default class Food {
  constructor(
    id,
    userId,
    name,
    calories,
    protein,
    carbs,
    fat,
    servingSize,
    servingUnit,
    access,
    description,
    imageUrl
  ) {
    this._id = id;
    this.userId = userId
    this.name = name;
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fat = fat;
    this.servingSize = servingSize;
    this.servingUnit = servingUnit;
    this.access = access;
    this.description = description;
    this.imageUrl = imageUrl;
  }
}
