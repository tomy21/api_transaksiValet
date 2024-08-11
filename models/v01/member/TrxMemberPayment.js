import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";
import TrxMemberPaidAmount from "./TrxMemberPaidAmount.js";
import MemberProviderPaymentGateway from "./MemberProviderPaymentGateway.js";

const TrxMemberPayment = db.define(
  "TrxMemberPayments",
  {
    Id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    Type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    PartnerServiceId: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    CustomerNo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    VirtualAccountNo: {
      type: DataTypes.STRING(28),
      allowNull: false,
    },
    VirtualAccountName: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    VirtualAccountEmail: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    TrxId: {
      type: DataTypes.STRING(18),
      allowNull: false,
    },
    InquiryRequestId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    PaymentRequestId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    PaymentFlagStatus: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    ExpiredDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    TrxDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    TransactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ReferenceNo: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    JournalNum: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    FlagAdvise: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    IsDeleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    TrxMemberTotalAmountId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    TrxMemberPaidAmountId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "TrxMemberPaidAmounts",
        key: "Id",
      },
    },
    TrxMemberAdditionalInfoId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    MemberUserProductId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "MemberUserProducts",
        key: "Id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "TrxMemberPayments",
    hooks: {
      beforeFind: (options) => {
        if (options.where && options.where.PartnerServiceId) {
          options.where.PartnerServiceId =
            options.where.PartnerServiceId.trim();
        }
      },
    },
  }
);

TrxMemberPayment.belongsTo(TrxMemberPaidAmount, {
  foreignKey: "TrxMemberPaidAmountId",
});
TrxMemberPaidAmount.hasMany(TrxMemberPayment, {
  foreignKey: "TrxMemberPaidAmountId",
});

TrxMemberPayment.belongsTo(MemberProviderPaymentGateway, {
  foreignKey: "PartnerServiceId",
  targetKey: "BankId",
});

export default TrxMemberPayment;
