import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";
import { Location } from "./RefLocation.js";

export const UsersLocations = db.define(
  "UsersLocation",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
    },
    LocationCode: {
      type: DataTypes.STRING(45),
    },
    CreatedOn: {
      type: DataTypes.DATE,
      field: "CreatedOn",
      defaultValue: DataTypes.NOW,
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      field: "UpdatedOn",
      defaultValue: DataTypes.NOW,
    },
    UpdatedBy: {
      type: DataTypes.STRING(50),
    },
    DeletedOn: {
      type: DataTypes.DATE,
      field: "DeletedOn",
    },
    DeletedBy: {
      type: DataTypes.STRING(50),
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
    },
    TypeValet: {
      type: DataTypes.INTEGER,
    },
    qrisVVIP: {
      type: DataTypes.STRING(250),
    },
    qrisCasualValet: {
      type: DataTypes.STRING(250),
    },
    tariffVVIP: {
      type: DataTypes.INTEGER,
    },
    tariffCasualValet: {
      type: DataTypes.INTEGER,
    },
    NMIDVIP: {
      type: DataTypes.STRING(250),
    },
    NameRekVIP: {
      type: DataTypes.STRING(250),
    },
    NMIDValet: {
      type: DataTypes.STRING(250),
    },
    NameRekValet: {
      type: DataTypes.STRING(250),
    },
  },
  {
    timestamps: false,
    tableName: "UsersLocation",
  }
);

UsersLocations.belongsTo(Location, {
  foreignKey: "LocationCode",
  targetKey: "Code",
});
