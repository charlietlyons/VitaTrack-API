import MongoClient from '../client/MongoClient.js';
import { logRequest } from '../util/Logger.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const HASH_SALT_ROUNDS=process.env.HASH_SALT_ROUNDS;

export default class UserService {
    constructor() {
        this.mongoClient = new MongoClient();
    }

    createUser = (user, successHandler, failHandler) => {
        try {
            this.mongoClient.findOne(user.username, (result) => {
                if (!result) {
                    bcrypt.genSalt(parseInt(HASH_SALT_ROUNDS)).then((salt) => {
                        bcrypt.hash(user.password, salt).then((hash) => {
                            user.password = hash;
                            this.mongoClient.insertOne(user);
                            successHandler();
                        });
                    });
                } else {
                    failHandler("User already exists");
                }
            }, (error) => {
                failHandler(error);
            });
        } catch (e) {
            failHandler(e)
        }
    }

    verifyUser = (user, successHandler, failHandler) => {
        try {
            this.mongoClient.findOne(user.username, (result) => {
                if (result) {
                    bcrypt.compare(user.password, result.password).then((match) => {
                        if (match) {
                            successHandler();
                        } else {
                            failHandler("Password does not match");
                        }
                    });
                } else {
                    failHandler("User does not exist");
                }
            }, (error) => {
                failHandler(error);
            });
        } catch (e) {
            failHandler(e)
        }
    }
}