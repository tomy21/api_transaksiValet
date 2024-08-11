import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberUserRole = db.define(
  "MemberUserRole",
  {
    UserId: {
      type: DataTypes.INTEGER,
      autoIncrement: false,
      primaryKey: true,
    },
    RoleId: {
      type: DataTypes.INTEGER,
      autoIncrement: false,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberUserRole;
