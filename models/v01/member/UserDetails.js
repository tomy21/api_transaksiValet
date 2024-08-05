import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";
import bcrypt from "bcryptjs";

const UserDetails = db.define(
  "MemberUserDetails",
  {
    FullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    IpAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Gender: {
      type: DataTypes.CHAR,
      allowNull: true,
    },
    Birthdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    IdNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0.0,
    },
    RewardPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    P256dh: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Auth: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Pin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    MemberUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "MemberUsers",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

UserDetails.beforeCreate(async (user) => {
  user.Pin = await bcrypt.hash(user.Pin, 12);
});

UserDetails.prototype.correctPassword = async function (candidatePin, userPin) {
  return await bcrypt.compare(candidatePin, userPin);
};

export default UserDetails;
