import MemberHistoryTransaction from "../../../models/v01/member/MemberHistoryTransaction.js";

// Create a new MemberHistoryTransaction
export const createMemberHistoryTransaction = async (req, res) => {
  try {
    const newTransaction = await MemberHistoryTransaction.create(req.body);
    res.status(201).json({
      statusCode: 201,
      message: "MemberHistoryTransaction created successfully",
      data: newTransaction,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

// Get all MemberHistoryTransactions
export const getAllMemberHistoryTransactions = async (req, res) => {
  try {
    const transactions = await MemberHistoryTransaction.findAll();
    res.status(200).json({
      statusCode: 200,
      message: "MemberHistoryTransactions retrieved successfully",
      data: transactions,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

// Get a single MemberHistoryTransaction by ID
export const getMemberHistoryTransaction = async (req, res) => {
  try {
    const transaction = await MemberHistoryTransaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        statusCode: 404,
        message: "MemberHistoryTransaction not found",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "MemberHistoryTransaction retrieved successfully",
      data: transaction,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const getHistoryByUserId = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing userId query parameter",
      });
    }

    const members = await MemberHistoryTransaction.findAll({
      where: {
        IdUsers: userId,
      },
    });
    console.log(members);
    if (members.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "MemberUserProduct not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "MemberUserProducts retrieved successfully",
      data: members,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};
