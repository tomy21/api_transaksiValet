import { DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberProductBundle = db.define(
  "MemberProductBundle",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    price: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberProductBundle;
