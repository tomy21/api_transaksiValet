import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";
import { Location } from "./RefLocation.js";

export const TransactionValet = db.define(
  "TransactionParkingValet",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    LocationCode: {
      type: DataTypes.STRING(30),
    },
    TrxNo: {
      type: DataTypes.STRING(50),
    },
    TicketNumber: {
      type: DataTypes.STRING(30),
    },
    VehiclePlate: {
      type: DataTypes.STRING(10),
    },
    ReferenceNo: {
      type: DataTypes.STRING(20),
    },
    ParkingValetStatusId: {
      type: DataTypes.INTEGER,
    },
    ParkingType: {
      type: DataTypes.INTEGER,
    },
    Tariff: {
      type: DataTypes.DOUBLE,
    },
    InTime: {
      type: DataTypes.DATE,
    },
    OutTime: {
      type: DataTypes.DATE,
    },
    ReceivedOn: {
      type: DataTypes.DATE,
    },
    ReceivedBy: {
      type: DataTypes.INTEGER,
    },
    ReceivedUserId: {
      type: DataTypes.INTEGER,
    },
    ReqPickupOn: {
      type: DataTypes.DATE,
    },
    ConfirmReqPickupOn: {
      type: DataTypes.DATE,
    },
    ConfirmReqPickupBy: {
      type: DataTypes.INTEGER,
    },
    ConfirmReqPickupUserId: {
      type: DataTypes.INTEGER,
    },
    ArrivedTimeStart: {
      type: DataTypes.DATE,
    },
    GracePeriod: {
      type: DataTypes.INTEGER,
    },
    ArrivedTimeFinish: {
      type: DataTypes.DATE,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      field: "CreatedOn",
      defaultValue: DataTypes.NOW,
    },
    CreatedBy: {
      type: DataTypes.STRING,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      field: "UpdatedOn",
      defaultValue: DataTypes.NOW,
    },
    UpdatedBy: {
      type: DataTypes.STRING,
    },
    PaymentOn: {
      type: DataTypes.DATE,
      field: "PaymentOn",
    },
    PaymentBy: {
      type: DataTypes.STRING,
    },
    DeletedOn: {
      type: DataTypes.DATE,
      field: "DeletedOn",
    },
    DeletedBy: {
      type: DataTypes.STRING,
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
    },
    foto1: {
      type: DataTypes.STRING,
    },
    foto2: {
      type: DataTypes.STRING,
    },
    foto3: {
      type: DataTypes.STRING,
    },
    foto4: {
      type: DataTypes.STRING,
    },
    foto5: {
      type: DataTypes.STRING,
    },
    foto6: {
      type: DataTypes.STRING,
    },
    NoKeySlot: {
      type: DataTypes.INTEGER,
    },
    fotoBuktiPayment1: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
    tableName: "TransactionParkingValet",
  }
);

TransactionValet.belongsTo(Location, {
  foreignKey: "LocationCode",
  targetKey: "Code",
});
