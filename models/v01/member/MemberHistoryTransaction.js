import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberHistoryTransaction = db.define(
  "MemberHistoryTransaction",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    IdUsers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LocationName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Activity: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    Price: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
    },
    Status: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    PlateNumber: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    // CreatedBy: {
    //   type: DataTypes.STRING(45),
    //   allowNull: false,
    // },
  },
  {
    timestamps: false,
  }
);

export default MemberHistoryTransaction;
