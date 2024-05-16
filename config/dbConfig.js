import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();

const db = new Sequelize("skybillingdb", "root", "50p4y5ky0v0!", {
  host: "8.215.44.147",
  dialect: "mysql",
  logging: false,
});

export default db;
