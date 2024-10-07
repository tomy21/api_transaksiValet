import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberProductBundle = db.define(
  "MemberProductBundle",
  {
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    IsDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    Price: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false,
    },
    CardActivateFee: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false,
    },
    Fee: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false,
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DeletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CreatedBy: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    UpdatedBy: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    DeletedBy: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    MemberProductId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberProductBundle;
