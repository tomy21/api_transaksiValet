import { DataTypes } from "sequelize";
import dbOCC from "../../config/dbLocal.js";

export const RoleMenu = dbOCC.define(
  "tbl_role_menus",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_role: {
      type: DataTypes.STRING,
    },
    id_menu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actions: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: true }
);
