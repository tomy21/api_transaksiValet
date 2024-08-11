import { errorResponse, successResponse } from "../../../config/response.js";
import MemberTenant from "../../../models/v01/member/MemberTenants.js";
import db from "../../../config/dbConfig.js";
import User from "../../../models/v01/member/Users.js";
import UserDetails from "../../../models/v01/member/UserDetails.js";
import MemberUserRole from "../../../models/v01/member/MemberUserRoles.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { sendEmail } from "../../../config/EmailService.js";

// Get all member tenants with pagination
export const getAllMemberTenants = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await MemberTenant.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["CreatedOn", "DESC"]], // Optional: Add ordering if needed
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      statusCode: 200,
      total: count,
      totalPages: totalPages,
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member tenant by ID
export const getMemberTenantById = async (req, res) => {
  try {
    const memberTenant = await MemberTenant.findByPk(req.params.id);
    if (memberTenant) {
      return successResponse(
        res,
        201,
        "Tenants retrieved successfully",
        memberTenant
      );
    } else {
      return errorResponse(
        res,
        400,
        "Product not found,The requested bundle does not exist",
        error.message
      );
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new member tenant
export const createMemberTenant = async (req, res) => {
  const transaction = await db.transaction();

  try {
    // Step 1: Create the Tenant
    const newMemberTenant = await MemberTenant.create(req.body, {
      transaction,
    });

    // Step 2: Automatically create a new User for this Tenant with RoleId: 5
    const { UserName, Email, Password, PhoneNumber, Pin } = req.body;

    const newUser = await User.create(
      {
        UserName: UserName,
        NormalizedUserName: UserName.toUpperCase(),
        Email: Email,
        NormalizedEmail: Email.toUpperCase(),
        PasswordHash: Password,
        PhoneNumber: PhoneNumber,
        MemberTenantId: newMemberTenant.Id,
      },
      { transaction }
    );

    // Step 3: Create UserDetails for the new user
    await UserDetails.create(
      {
        Pin: Pin,
        MemberUserId: newUser.id,
      },
      { transaction }
    );

    // Step 4: Assign the RoleId: 5 to the new user
    await MemberUserRole.create(
      {
        UserId: newUser.id,
        RoleId: 5, // Assuming RoleId 5 is the role you want to assign
      },
      { transaction }
    );

    // Step 5: Generate an activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    newUser.activationToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");
    newUser.activationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
    await newUser.save({ validate: false });

    // Step 6: Generate activation URL
    const activationURL = `${req.protocol}://${req.get(
      "host"
    )}/v01/member/api/auth/activate/${activationToken}`;

    // Step 7: Send activation email with user information
    await sendEmail({
      to: newUser.Email,
      subject: "Account Activation",
      text: `Please activate your account by clicking on the link: ${activationURL}`,
      html: `
        <h1>Account Activation</h1>
        <p>Please activate your account by clicking on the link below:</p>
        <a href="${activationURL}">Activate Account</a>
        <h3>Your account details:</h3>
        <ul>
          <li>Username: ${newUser.UserName}</li>
          <li>Email: ${newUser.Email}</li>
          <li>PIN: ${Pin}</li>
          <li>Password: ${Password}</li>
        </ul>
        <p>Please keep this information safe.</p>
      `,
    });

    // Commit transaction after all operations succeed
    await transaction.commit();

    return successResponse(
      res,
      201,
      "Tenant and associated user created successfully",
      { tenant: newMemberTenant, user: newUser }
    );
  } catch (error) {
    await transaction.rollback();

    return errorResponse(
      res,
      500,
      "An error occurred while creating Tenant and user",
      error.message
    );
  }
};

// Update member tenant by ID
export const updateMemberTenant = async (req, res) => {
  try {
    const [updated] = await MemberTenant.update(req.body, {
      where: { Id: req.params.id },
    });
    if (updated) {
      const updatedMemberTenant = await MemberTenant.findByPk(req.params.id);
      return successResponse(
        res,
        201,
        "Tenants updated successfully",
        updatedMemberTenant
      );
    } else {
      return errorResponse(res, 404, "Member Tenant not found", error.message);
    }
  } catch (error) {
    return errorResponse(res, 500, "Member Tenant error", error.message);
  }
};

// Delete member tenant by ID
export const deleteMemberTenant = async (req, res) => {
  try {
    const deleted = await MemberTenant.destroy({
      where: { Id: req.params.id },
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: "Member Tenant not found" });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
