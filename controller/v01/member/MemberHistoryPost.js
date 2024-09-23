import MemberHistoryPost from "../../../models/v01/member/MemberHistoryPost.js";
import { Op } from "sequelize";

// Get All with Pagination and Search
export const getAllMemberPoints = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    const memberPoints = await MemberHistoryPost.findAndCountAll({
      where: {
        [Op.or]: [
          { CardId: { [Op.like]: `%${search}%` } }, // Search by CardId
          { LocationId: { [Op.like]: `%${search}%` } }, // Search by LocationId
        ],
      },
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      totalItems: memberPoints.count,
      totalPages: Math.ceil(memberPoints.count / limit),
      currentPage: parseInt(page),
      data: memberPoints.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

// Get Member Point by ID
export const getMemberPointById = async (req, res) => {
  const { id } = req.params;

  try {
    const memberPoint = await MemberHistoryPost.findByPk(id);

    if (!memberPoint) {
      return res.status(404).json({ message: "Member Point not found" });
    }

    res.status(200).json(memberPoint);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

// Get Member Points by CardId
export const getMemberPointByCardId = async (req, res) => {
  const { cardId } = req.params;

  try {
    const memberPoints = await MemberHistoryPost.findAll({
      where: { CardId: cardId },
    });

    if (memberPoints.length === 0) {
      return res
        .status(404)
        .json({ message: "No Member Points found for the given CardId" });
    }

    res.status(200).json(memberPoints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
