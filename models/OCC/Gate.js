import { DataTypes } from "sequelize";
import dbOCC from "../../config/dbLocal.js";
import { LocationCCC } from "./Location.js";

export const Gate = dbOCC.define(
  "tbl_gate",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_location: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    gate: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    channel_cctv: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    arduino: {
      type: DataTypes.ENUM("0", "1"),
      allowNull: false,
    },
    id_tele: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    paranoid: true, // Enable soft delete
    tableName: "tbl_gate", // Nama tabel di database
  }
);

Gate.belongsTo(LocationCCC, {
  foreignKey: "id_location", // Foreign key di Gate
  targetKey: "id", // Primary key di LocationCCC
  as: "location", // Alias untuk relasi ini
});

export default Gate;
