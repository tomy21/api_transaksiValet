import TempTransactionMemberTenant from "../../../models/v01/member/TempTransactionMemberTenants.js";
import { successResponse, errorResponse } from "../../../config/response.js";

// Get all entries
export const getAllTempTransactionMemberTenants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Halaman saat ini, default ke 1 jika tidak ada
    const pageSize = parseInt(req.query.pageSize) || 10; // Jumlah item per halaman, default ke 10 jika tidak ada

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { count, rows } = await TempTransactionMemberTenant.findAndCountAll({
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / pageSize);

    return successResponse(res, 200, "Tenants retrieved successfully", {
      tenants: rows,
      pagination: {
        totalItems: count,
        totalPages: totalPages,
        currentPage: page,
        pageSize: pageSize,
      },
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while retrieving tenants",
      error.message
    );
  }
};

// Get entry by ID
export const getTempTransactionMemberTenantById = async (req, res) => {
  try {
    const tenant = await TempTransactionMemberTenant.findByPk(req.params.id);
    if (tenant) {
      return successResponse(res, 200, "Tenant retrieved successfully", tenant);
    } else {
      return errorResponse(
        res,
        404,
        "Tenant not found",
        "The requested tenant does not exist"
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while retrieving tenant",
      error.message
    );
  }
};

// Create a new entry
export const createTempTransactionMemberTenant = async (req, res) => {
  try {
    const newTenant = await TempTransactionMemberTenant.create(req.body);
    return successResponse(res, 201, "Tenant created successfully", newTenant);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while creating tenant",
      error.message
    );
  }
};

// Update an entry
export const updateTempTransactionMemberTenant = async (req, res) => {
  try {
    const [updated] = await TempTransactionMemberTenant.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedTenant = await TempTransactionMemberTenant.findByPk(
        req.params.id
      );
      return successResponse(
        res,
        200,
        "Tenant updated successfully",
        updatedTenant
      );
    } else {
      return errorResponse(
        res,
        404,
        "Tenant not found",
        "The requested tenant does not exist"
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while updating tenant",
      error.message
    );
  }
};

// Delete an entry
export const deleteTempTransactionMemberTenant = async (req, res) => {
  try {
    const [deleted] = await TempTransactionMemberTenant.update(
      { DeletedOn: Sequelize.fn("NOW") },
      { where: { id: req.params.id } }
    );
    if (deleted) {
      return successResponse(res, 200, "Tenant deleted successfully", null);
    } else {
      return errorResponse(
        res,
        404,
        "Tenant not found",
        "The requested tenant does not exist"
      );
    }
  } catch (error) {
    return errorResponse(
      res,
      500,
      "An error occurred while deleting tenant",
      error.message
    );
  }
};
