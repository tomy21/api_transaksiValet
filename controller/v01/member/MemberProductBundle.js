import { errorResponse, successResponse } from "../../../config/response.js";
import MemberProductBundle from "../../../models/v01/member/MemberProductBundle.js";
import TrxMemberQuota from "../../../models/v01/member/TrxMemberQuota.js";

export const getAllMemberProductBundles = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;

  try {
    const { count, rows } = await MemberProductBundle.findAndCountAll({
      where: { isDeleted: false },
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [["createdOn", "DESC"]],
      include: {
        model: TrxMemberQuota,
        as: "TrxMemberQuote",
      },
    });

    return successResponse(res, 200, "Products retrieved successfully", {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      bundles: rows,
    });
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
    return successResponse(res, 201, "Product created successfully", bundle);
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
    const bundle = await MemberProductBundle.findByPk(req.params.Id, {
      include: {
        model: TrxMemberQuota,
        as: "TrxMemberQuote", // Menggunakan alias yang sesuai
      },
    });
    if (bundle) {
      return successResponse(
        res,
        200,
        "Product retrieved successfully",
        bundle
      );
    } else {
      return errorResponse(
        res,
        404,
        "Product not found",
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

export const getProductByType = async (req, res) => {
  try {
    const { vehicleType } = req.params;

    const products = await MemberProductBundle.findAll({
      where: { Type: vehicleType },
      include: {
        model: TrxMemberQuota,
        as: "TrxMemberQuote",
      },
    });

    if (products.length > 0) {
      return successResponse(
        res,
        200,
        "Products retrieved successfully",
        products
      );
    } else {
      return errorResponse(
        res,
        404,
        "No products found",
        `No products found for vehicle type: ${vehicleType}`
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while retrieving products",
      error.message
    );
  }
};
