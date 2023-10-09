import { MongoClient as MongoClientInstance } from "mongodb";
import dotenv from "dotenv";
import { logEvent, logError } from "../../util/Logger.js";

dotenv.config();

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.4fcf2.mongodb.net/?retryWrites=true&w=majority`;

export default class MongoClient {
  constructor() {
    this.client = new MongoClientInstance(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async getOneById(tableName, id) {
    const query = { _id: id };

    const data = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .findOne(query);

    if (data) {
      logEvent(`${tableName} data found with id: ${id}`);
    } else {
      logEvent(`${tableName} data not found with id: ${id}`);
    }
    return data;
  }

  async getOneByQuery(tableName, query) {
    const result = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .findOne(query);

    if (result) {
      logEvent(`${tableName} data found by query.`);
    } else {
      logEvent(`${tableName} data not found by query.`);
    }
    return result;
  }

  async getManyByQuery(tableName, query) {
    const transformedQuery = Array.isArray(query) ? { $or: query } : query;

    const result = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .find(transformedQuery)
      .toArray();
    if (result && result.length > 0) {
      logEvent(`${tableName} data found by query.`);
    } else {
      logEvent(`${tableName} data not found by query.`);
    }
    return result;
  }

  async post(tableName, body) {
    const result = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .insertOne(body);
    logEvent(`Inserted into ${tableName} with the id: ${result.insertedId}`);
  }

  async patch(tableName, body) {
    const result = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .updateOne(
        { _id: body._id },
        {
          $set: body,
        }
      );
    if (result.modifiedCount === 1) {
      logEvent(`${tableName} data updated with id: ${body._id}`);
    } else {
      throw Error(`Could not update ${tableName} data with id: ${body._id}`);
    }
  }

  async delete(tableName, id) {
    const result = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .deleteOne({ _id: id });

    if (!result) {
      logError(`Could not delete record in ${tableName} of id: ${id}`);
    } else {
      logError(`Deleted record in ${tableName} of id: ${id}`);
    }
    return result;
  }

  async deleteAll(tableName) {
    const result = await this.client
      .db(DB_NAME)
      .collection(tableName)
      .deleteMany({});

    if (result) {
      logEvent(
        `${
          tableName.charAt(0).toUpperCase() + tableName.slice(1)
        } table reset. ${result.deletedCount} entries deleted.`
      );
    }
    return result;
  }
}
