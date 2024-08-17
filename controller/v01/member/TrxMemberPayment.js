import TrxMemberPayments from "../../../models/v01/member/TrxMemberPayment.js";
import TrxMemberPaidAmounts from "../../../models/v01/member/TrxMemberPaidAmount.js";
import MemberProviderPaymentGateway from "../../../models/v01/member/MemberProviderPaymentGateway.js";
import { Op, Sequelize } from "sequelize";
import db from "../../../config/dbConfig.js";
import { errorResponse, successResponse } from "../../../config/response.js";

export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [results] = await db.query(
      `
      SELECT
        payments.*, 
        COALESCE(paidAmounts.Value, 0) AS 'TrxMemberPaidAmount.Value', 
        paidAmounts.Currency AS 'TrxMemberPaidAmount.Currency', 
        gateways.ProviderName AS 'MemberProviderPaymentGateway.ProviderName'
      FROM 
        TrxMemberPayments AS payments
      LEFT JOIN 
        TrxMemberPaidAmounts AS paidAmounts ON payments.TrxMemberPaidAmountId = paidAmounts.Id
      LEFT JOIN 
        MemberProviderPaymentGateways AS gateways 
      ON TRIM(payments.PartnerServiceId) = gateways.BankId
      ORDER BY payments.TrxDateTime DESC
      LIMIT :limit OFFSET :offset
    `,
      {
        replacements: { limit: parseInt(limit), offset: parseInt(offset) },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const [countQuery] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM TrxMemberPayments
    `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const count = countQuery[0].count;
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      total: count,
      totalPages: totalPages,
      currentPage: parseInt(page),
      data: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await TrxMemberPayments.findByPk(req.params.id, {
      include: [
        {
          model: TrxMemberPaidAmounts,
          attributes: ["Value", "Currency"],
        },
      ],
    });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const newPayment = await TrxMemberPayments.create(req.body);
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const [updated] = await TrxMemberPayments.update(req.body, {
      where: { Id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ error: "Payment not found" });
    }
    const updatedPayment = await TrxMemberPayments.findByPk(req.params.id);
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const deleted = await TrxMemberPayments.destroy({
      where: { Id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentByTrxId = async (req, res) => {
  try {
    const payment = await TrxMemberPayments.findAll({
      where: { TrxId: req.params.trxId },
      attributes: ["Id"],
    });

    // Cek apakah hasilnya kosong
    if (payment.length === 0) {
      return errorResponse(res, 404, "Failed", "Payment not found");
    }

    return successResponse(res, 200, "Success", payment);
  } catch (err) {
    return errorResponse(res, 500, "Failed to create data", err.message);
  }
};
