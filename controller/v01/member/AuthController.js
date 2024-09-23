import jwt from "jsonwebtoken";
import User from "../../../models/v01/member/Users.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Op } from "sequelize";
import UserDetails from "../../../models/v01/member/UserDetails.js";
import { v4 as uuidv4 } from "uuid";
import MemberUserProduct from "../../../models/v01/member/MemberUserProduct.js";
import { errorResponse, successResponse } from "../../../config/response.js";
import MemberRole from "../../../models/v01/member/RoleModel.js";
import MemberUserRole from "../../../models/v01/member/MemberUserRoles.js";
import MemberUserToken from "../../../models/v01/member/MemberUserToken.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";

const signToken = (user, rememberMe) => {
  const expiresIn = rememberMe ? "30d" : "1d";

  const payload = {
    Id: user.id,
    email: user.Email,
    iat: Math.floor(Date.now() / 1000),
    iss: "https://skyparking.online",
    jti: uuidv4(),
    nbf: Math.floor(Date.now() / 1000),
    role: user.Role,
    sub: user.UserName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });

  return token;
};

const createSendToken = (user, statusCode, res, rememberMe) => {
  const token = signToken(user, rememberMe);

  res.cookie("refreshToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000),
  });

  res.status(statusCode).json({
    status: "success",
    token,
    message: "Login Successfully",
  });
};

export const login = async (req, res) => {
  const { identifier, password, rememberMe } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      status: "fail",
      message:
        "Please provide an identifier (username, email, or phone number) and password!",
    });
  }

  // Find user by username, email, or phone number
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { UserName: identifier },
        { Email: identifier },
        { PhoneNumber: identifier },
      ],
    },
  });

  if (!user || !(await user.correctPassword(password, user.PasswordHash))) {
    return res.status(401).json({
      status: "fail",
      message: "Incorrect identifier or password",
    });
  }

  // Update the last login time
  user.LastLogin = new Date();
  await user.save({ validate: false });

  // Pass rememberMe flag to createSendToken function
  createSendToken(user, 200, res, rememberMe);
};

export const register = async (req, res) => {
  try {
    const { username, email, password, phone, pin, roleId } = req.body;

    const newUser = await User.create({
      UserName: username,
      NormalizedUserName: username.toUpperCase(),
      Email: email,
      NormalizedEmail: email.toUpperCase(),
      PasswordHash: password,
      PhoneNumber: phone,
    });

    await UserDetails.create({
      Pin: pin,
      MemberUserId: newUser.id,
    });

    await MemberUserRole.create({
      UserId: newUser.id,
      RoleId: roleId || 4,
    });

    const activationToken = newUser.createActivationToken();
    await newUser.save({ validate: false });

    const activationURL = `${req.protocol}://${req.get(
      "host"
    )}/v01/member/api/auth/activate/${activationToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com", // Server SMTP Outlook
      port: 587, // Port SMTP
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.Email,
      subject: "Account Activation",
      text: `Please activate your account by clicking on the link: ${activationURL}`,
    };

    await transporter.sendMail(mailOptions);

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      where: {
        activationToken: hashedToken,
        activationExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    user.EmailConfirmed = 1;
    user.activationToken = null;
    user.activationExpires = null;
    await user.save();

    // Redirect ke halaman setelah sukses aktivasi
    res.redirect("https://dev-membership.skyparking.online/");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userById = await User.findByPk(req.params.id);
    const usersDetailById = await UserDetails.findOne({
      where: {
        MemberUserId: req.params.id,
      },
    });
    if (!userById) {
      return res.status(404).json({
        statusCode: 404,
        message: "No users found with that ID",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Users retrieved successfully",
      points: usersDetailById.Points,
      detaildata: usersDetailById,
      data: userById,
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const getUserByIdDetail = async (req, res) => {
  const { MemberUserId, Pin } = req.body;
  try {
    const users = await UserDetails.findOne({
      where: {
        MemberUserId: MemberUserId,
      },
    });
    if (!users || !(await users.correctPassword(Pin, users.Pin))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect pin",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Pin is valid",
    });
  } catch (err) {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const offset = (page - 1) * limit;

    // Query pertama untuk menghitung total user di tabel User tanpa include
    const totalUsers = await User.count();

    // Query kedua untuk mendapatkan data user dengan relasi yang diinginkan
    const rows = await User.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdOn", "DESC"]],
      include: [
        {
          model: UserDetails,
          attributes: ["Points"],
        },
        {
          model: MemberUserProduct,
          attributes: ["CardId"],
        },
        {
          model: MemberUserRole,
          attributes: ["RoleId"],
        },
      ],
    });

    // Menghitung total halaman
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      total: totalUsers,
      totalPages: totalPages,
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const userRole = async (req, res) => {
  try {
    const { Name, NormalizedName, ConcurrencyStamp } = req.body;
    const role = await MemberRole.create({
      Name,
      NormalizedName,
      ConcurrencyStamp,
    });
    return successResponse(res, 200, "Get Data successfully", {
      role,
    });
  } catch (err) {
    return errorResponse(res, 500, "Error", err.message);
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await MemberRole.findAll();
    return successResponse(res, 200, "Get Data successfully", {
      roles,
    });
  } catch (error) {
    return errorResponse(res, 500, "Error", error.message);
  }
};

export const getRoleById = async (req, res) => {
  try {
    const dataRoles = await MemberUserRole.findByPk(req.params.id);
    return successResponse(res, 200, "Get Data successfully", {
      data: dataRoles,
    });
  } catch (error) {
    return errorResponse(res, 500, "Error", error.message);
  }
};

export const updateUserDetails = async (req, res) => {
  const { id } = req.params; // Extract the MemberUserId from the URL
  const {
    FullName,
    IpAddress,
    Gender,
    Birthdate,
    Address,
    IdNumber,
    Points,
    RewardPoints,
    P256dh,
    Auth,
    Url,
    Pin,
  } = req.body;

  try {
    const user = await UserDetails.findOne({ where: { Id: id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.FullName = FullName || user.FullName;
    user.IpAddress = IpAddress || user.IpAddress;
    user.Gender = Gender || user.Gender;
    user.Birthdate = Birthdate || user.Birthdate;
    user.Address = Address || user.Address;
    user.IdNumber = IdNumber || user.IdNumber;
    user.Points = Points !== undefined ? Points : user.Points; // Check if Points is explicitly passed
    user.RewardPoints =
      RewardPoints !== undefined ? RewardPoints : user.RewardPoints;
    user.P256dh = P256dh || user.P256dh;
    user.Auth = Auth || user.Auth;
    user.Url = Url || user.Url;
    user.Pin = Pin || user.Pin;

    // Save the updated user details
    await user.save();

    res.status(200).json({
      message: "User details updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const data = await MemberUserToken.create({
      UserId: user.id,
      LoginProvider: "reset_password",
      Name: "password_reset_token",
      Value: hashedToken,
      ExpiredDate: new Date(Date.now() + 30 * 60 * 1000), // Token berlaku 30 menit
    });

    // Kirim email dengan token
    const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com", // Server SMTP Outlook
      port: 587, // Port SMTP
      secure: false, // Gunakan false untuk port 587
      auth: {
        user: process.env.EMAIL_USER, // Gantilah dengan email pengguna Outlook Anda
        pass: process.env.EMAIL_PASS, // Gantilah dengan password email pengguna Outlook Anda
      },
      tls: {
        ciphers: "SSLv3", // Menetapkan cipher yang aman
      },
    });

    // Contoh pengiriman email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Gantilah dengan email pengguna Outlook Anda
      to: email, // Email tujuan
      subject: "Account Activation",
      text: `Please activate your account by clicking on the link: ${resetURL}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "Reset password email sent successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const memberUserToken = await MemberUserToken.findOne({
      where: {
        Value: hashedToken,
        ExpiredDate: { [Op.gt]: new Date() }, // Cek apakah token belum expired
      },
    });

    if (!memberUserToken) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid or expired token" });
    }
    const user = await User.findByPk(memberUserToken.UserId);
    user.PasswordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
