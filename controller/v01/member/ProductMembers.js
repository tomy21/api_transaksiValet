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
    const products = await MemberProduct.findAll();
    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
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
