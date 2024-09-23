import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberHistoryPost = db.define(
  "MemberHistoryPosts",
  {
    Id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Kid: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    LocationId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    CardId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    MinimumPoint: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Point: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    VehicleType: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    Duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Status: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "MemberHistoryPosts", // Ubah nama tabel sesuai kebutuhan jika perlu
  }
);

export default MemberHistoryPost;
