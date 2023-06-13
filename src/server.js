import dotenv from 'dotenv';
import express from 'express';
import routes from './routes.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT, function () {
  console.log(`Running on port ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(routes);