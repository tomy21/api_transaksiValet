import { errorResponse, successResponse } from "../../../config/response.js";
import { Location } from "../../../models/RefLocation.js";
import MemberProduct from "../../../models/v01/member/ProductMember.js";

// Create a new member product
export const createMemberProduct = async (req, res) => {
  try {
    const newProduct = await MemberProduct.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get all member products
export const getAllMemberProducts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const { count, rows } = await MemberProduct.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [["Id", "DESC"]],
      include: [
        {
          model: Location,
          attributes: ["Name", "Region", "Vendor"],
        },
      ],
    });

    return successResponse(res, 200, "Products retrieved successfully", {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      products: rows,
    });
  } catch (err) {
    return errorResponse(
      res,
      500,
      "An error occurred while retrieving bundles",
      err.message
    );
  }
};

// Get a single member product by ID
export const getMemberProduct = async (req, res) => {
  try {
    const product = await MemberProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getMemberProductByLocation = async (req, res) => {
  try {
    const { LocationCode } = req.query; // Ambil LocationCode dari query string
    if (!LocationCode) {
      return res.status(400).json({
        status: "fail",
        message: "LocationCode is required",
      });
    }

    const product = await MemberProduct.findAll({
      where: { LocationCode }, // Gunakan objek untuk query
    });

    if (product.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update a member product by ID
export const updateMemberProduct = async (req, res) => {
  try {
    const product = await MemberProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    await product.update(req.body);
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete a member product by ID
export const deleteMemberProduct = async (req, res) => {
  try {
    const product = await MemberProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        message: "Product not found",
      });
    }
    product.DeletedOn = new Date();
    product.DeletedBy = req.user ? req.user.username : "admin"; // Assuming `req.user` contains the logged-in user info
    await product.save();
    res.status(200).json({
      statusCode: 200,
      message: "Product soft deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};
