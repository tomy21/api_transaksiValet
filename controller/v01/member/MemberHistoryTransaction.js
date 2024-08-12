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
    const transactions = await MemberHistoryTransaction.findAll({
      where: { memberId: req.params.id }, // Mengasumsikan memberId sebagai foreign key
      order: [["createdAt", "DESC"]], // Mengurutkan berdasarkan createdAt descending
    });

    if (!transactions || transactions.length === 0) {
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
    const page = parseInt(req.query.page) || 1; // Default ke halaman pertama
    const limit = parseInt(req.query.limit) || 10; // Default limit 10 item per halaman

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing userId query parameter",
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await MemberHistoryTransaction.findAndCountAll({
      where: {
        IdUsers: userId,
      },
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    if (rows.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "MemberUserProduct not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "MemberUserProducts retrieved successfully",
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      data: rows,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};
