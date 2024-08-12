// controllers/v01/member/TrxMemberQuotaController.js
import { errorResponse, successResponse } from "../../../config/response.js";
import TrxMemberQuota from "../../../models/v01/member/TrxMemberQuota.js";

// Get all records
export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await TrxMemberQuota.findAll();
    return successResponse(res, 200, "Success get quota members", quotes);
  } catch (err) {
    return errorResponse(res, 500, "Failed to get data", err.message);
  }
};

// Get a single record by ID
export const getQuoteById = async (req, res) => {
  try {
    const quote = await TrxMemberQuota.findByPk(req.params.id);
    if (!quote) {
      return errorResponse(res, 404, "TrxMemberQuota not found");
    }
    return successResponse(res, 200, "Success get quota member", quote);
  } catch (err) {
    return errorResponse(res, 500, "Failed to get data", err.message);
  }
};

// Create a new record
export const createQuote = async (req, res) => {
  try {
    const { Year, Month, CurrentQuota, MemberProductId } = req.body;
    const newQuote = await TrxMemberQuota.create({
      Year,
      Month,
      CurrentQuota,
      MemberProductId,
    });
    return successResponse(
      res,
      201,
      "Quota member created successfully",
      newQuote
    );
  } catch (err) {
    return errorResponse(res, 500, "Failed to create data", err.message);
  }
};

// Update a record by ID
export const updateQuote = async (req, res) => {
  try {
    const { Year, Month, CurrentQuota, MemberProductId } = req.body;
    const [updated] = await TrxMemberQuota.update(
      { Year, Month, CurrentQuota, MemberProductId },
      { where: { Id: req.params.id } }
    );
    if (!updated) {
      return errorResponse(res, 404, "TrxMemberQuota not found");
    }
    return successResponse(res, 200, "Quota member updated successfully");
  } catch (err) {
    return errorResponse(res, 500, "Failed to update data", err.message);
  }
};

// Delete a record by ID
export const deleteQuote = async (req, res) => {
  try {
    const deleted = await TrxMemberQuota.destroy({
      where: { Id: req.params.id },
    });
    if (!deleted) {
      return errorResponse(res, 404, "TrxMemberQuota not found");
    }
    return successResponse(res, 200, "Quota member deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, "Failed to delete data", err.message);
  }
};
