import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../../../config/dbConfig.js";

const User = db.define(
  "MemberUsers",
  {
    Points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    MemberTenantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    NormalizedUserName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    NormalizedEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    EmailConfirmed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    PasswordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SecurityStamp: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ConcurrencyStamp: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    PhoneNumberConfirmed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    TwoFactorEnabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    LockoutEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    LockoutEnabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    AccessFailedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    ActivationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ActivationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    LastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

User.beforeCreate(async (user) => {
  user.PasswordHash = await bcrypt.hash(user.PasswordHash, 12);
});

User.prototype.createActivationToken = function () {
  const activationToken = crypto.randomBytes(32).toString("hex");
  this.ActivationToken = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");
  this.ActivationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return activationToken;
};

User.prototype.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default User;
