import { DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberProviderPaymentGateway = db.define(
  "MemberProviderPaymentGateway",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ProviderName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    Type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ChannelId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    BankId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    PartnerServiceId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    LogoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    UpdatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberProviderPaymentGateway;
