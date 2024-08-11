import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberProviderPaymentGateway = db.define(
  "MemberProviderPaymentGateways",
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
    ChannelId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Type: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    BankId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    UpdatedOn: {
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
    IsDeleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    MemberProviderAdditionalInfoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberProviderPaymentGateway;
