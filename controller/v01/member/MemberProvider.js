import MemberProviderPaymentGateway from "../../../models/v01/member/MemberProvider.js";

// Create a new payment gateway
export const createPaymentGateway = async (req, res) => {
  try {
    const newGateway = await MemberProviderPaymentGateway.create(req.body);
    res.status(201).json({
      statusCode: 201,
      message: "Payment gateway created successfully",
      data: newGateway,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const getProviderByisOpen = async (req, res) => {
  try {
    const isOpen = req.query.isOpen;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!isOpen) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing isOpen query parameter",
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await MemberProviderPaymentGateway.findAndCountAll({
      where: {
        IsOpen: isOpen,
      },
      order: [["createdOn", "DESC"]],
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
      message: "Provider retrieved successfully",
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

// Get all payment gateways
export const getAllPaymentGateways = async (req, res) => {
  try {
    const providerPaymentGateways =
      await MemberProviderPaymentGateway.findAll();
    res.status(200).json({
      statusCode: 200,
      message: "Provider payment gateways retrieved successfully",
      data: providerPaymentGateways,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

// Get a payment gateway by ID
export const getPaymentGateway = async (req, res) => {
  try {
    const providerPaymentGateway = await MemberProviderPaymentGateway.findByPk(
      req.params.id
    );
    if (!providerPaymentGateway) {
      return res.status(404).json({
        statusCode: 404,
        message: "No provider payment gateway found with that ID",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Provider payment gateway retrieved successfully",
      data: providerPaymentGateway,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

// Update a payment gateway by ID
export const updatePaymentGateway = async (req, res) => {
  try {
    const [updated] = await MemberProviderPaymentGateway.update(req.body, {
      where: { Id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({
        statusCode: 404,
        message: "Payment gateway not found",
      });
    }
    const updatedGateway = await MemberProviderPaymentGateway.findByPk(
      req.params.id
    );
    res.status(200).json({
      statusCode: 200,
      message: "Payment gateway updated successfully",
      data: updatedGateway,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

// Soft delete a payment gateway by ID
// export const deletePaymentGateway = async (req, res) => {
//   try {
//     const gateway = await MemberProvider.findByPk(req.params.id);
//     if (!gateway) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: "Payment gateway not found",
//       });
//     }
//     gateway.DeletedOn = new Date();
//     gateway.DeletedBy = req.user ? req.user.username : "admin"; // Assuming req.user contains the logged-in user info
//     await gateway.save();
//     res.status(200).json({
//       statusCode: 200,
//       message: "Payment gateway soft deleted successfully",
//     });
//   } catch (err) {
//     res.status(400).json({
//       statusCode: 400,
//       message: err.message,
//     });
//   }
// };
