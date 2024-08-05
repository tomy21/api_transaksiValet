import { successResponse } from "../../../config/response.js";
import MemberProductBundle from "../../../models/v01/member/MemberProductBundle.js";

export const getAllMemberProductBundles = async (req, res) => {
  try {
    const bundles = await MemberProductBundle.findAll({
      where: { isDeleted: false },
    });

    return successResponse(res, 200, "Bundles retrieved successfully", bundles);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while retrieving bundles",
      error.message
    );
  }
};

export const createMemberProductBundle = async (req, res) => {
  try {
    const bundle = await MemberProductBundle.create(req.body);
    return successResponse(res, 201, "Bundle created successfully", bundle);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while creating bundle",
      error.message
    );
  }
};

export const getMemberProductBundle = async (req, res) => {
  try {
    const bundle = await MemberProductBundle.findByPk(req.params.id);
    if (bundle) {
      return successResponse(res, 200, "Bundle retrieved successfully", bundle);
    } else {
      return errorResponse(
        res,
        404,
        "Bundle not found",
        "The requested bundle does not exist"
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while retrieving bundle",
      error.message
    );
  }
};

export const updateMemberProductBundle = async (req, res) => {
  try {
    const [updated] = await MemberProductBundle.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedBundle = await MemberProductBundle.findByPk(req.params.id);
      return successResponse(
        res,
        200,
        "Bundle updated successfully",
        updatedBundle
      );
    } else {
      return errorResponse(
        res,
        404,
        "Bundle not found",
        "The requested bundle does not exist"
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while updating bundle",
      error.message
    );
  }
};

export const deleteMemberProductBundle = async (req, res) => {
  try {
    const [deleted] = await MemberProductBundle.update(
      { isDeleted: true },
      {
        where: { id: req.params.id },
      }
    );
    if (deleted) {
      return successResponse(res, 204, "Bundle deleted successfully", null);
    } else {
      return errorResponse(
        res,
        404,
        "Bundle not found",
        "The requested bundle does not exist"
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while deleting bundle",
      error.message
    );
  }
};
