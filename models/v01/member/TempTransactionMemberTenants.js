import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const TempTransactionMemberTenant = db.define(
  "temp_TransactionMemberTenants",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    OrderId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    TenantName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    LocationCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    LocationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    QuotaMember: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ProductName: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    CreatedBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    UpdatedBy: {
      type: DataTypes.STRING(255),
    },
    DeletedBy: {
      type: DataTypes.STRING(255),
    },
    CreatedOn: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    DeletedOn: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
    tableName: "temp_TransactionMemberTenants",
  }
);

export default TempTransactionMemberTenant;
