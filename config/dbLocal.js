import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();

const dbOCC = new Sequelize(
  process.env.DB_NAME_DUMP,
  process.env.DB_USER_DUMP,
  process.env.DB_PASSWORD_DUMP,
  {
    host: process.env.DB_HOST_DUMP,
    dialect: "mysql",
    logging: false,
    timezone: "+07:00",
  }
);

export default dbOCC;
