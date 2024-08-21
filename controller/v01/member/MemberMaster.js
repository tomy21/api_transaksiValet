import { successResponse } from "../../../config/response.js";
import MemberMaster from "../../../models/v01/member/MemberMaster.js";

export const getMemberMasterData = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const cardNo = req.query.cardNo;

    const whereCondition = cardNo ? { CardNo: cardNo } : {};

    const { count, rows } = await MemberMaster.findAndCountAll({
      where: whereCondition,
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [["UpdatedOn", "DESC"]],
    });

    return successResponse(res, 200, "Get Data successfully", {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      transaction: rows,
    });
  } catch (error) {
    console.error("Error fetching data from view:", error);
    return errorResponse(res, 500, "Internal Server Error", error);
  }
};
