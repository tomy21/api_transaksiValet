// models/MemberUserProduct.js
import { DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";
import TrxHistoryMemberProducts from "./TrxHistoryMemberProducts.js";
import MemberProduct from "./ProductMember.js";

const MemberUserProduct = db.define(
  "MemberUserProduct",
  {
    Id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    CardId: {
      type: DataTypes.STRING(127),
      allowNull: false,
    },
    RfId: {
      type: DataTypes.STRING(127),
      allowNull: false,
    },
    PlateNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    IsUsed: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
    IsDeleted: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
    UsePoint: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
    MemberUserId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "MemberUsers",
        key: "id",
      },
    },
    KID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    // TypeVehicle: {
    //   type: DataTypes.STRING(50),
    //   allowNull: false,
    // },
    CreatedOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DeletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DeletedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

MemberUserProduct.hasMany(TrxHistoryMemberProducts, {
  foreignKey: "MemberUserProductId",
  as: "TrxHistories",
});

TrxHistoryMemberProducts.belongsTo(MemberUserProduct, {
  foreignKey: "MemberUserProductId",
  as: "MemberUserProduct",
});

TrxHistoryMemberProducts.belongsTo(MemberProduct, {
  foreignKey: "MemberProductId",
  as: "MemberProduct",
});

export default MemberUserProduct;
