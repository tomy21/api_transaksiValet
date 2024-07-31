import jwt from "jsonwebtoken";
import User from "../../../models/v01/member/Users.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Op } from "sequelize";
import UserDetails from "../../../models/v01/member/UserDetails.js";
import { v4 as uuidv4 } from "uuid";

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
    httpOnly: true,
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
    const { username, email, password, phone, pin } = req.body;

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

    console.log("data", user);

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

    createSendToken(user, 200, res);
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
    if (!userById) {
      return res.status(404).json({
        statusCode: 404,
        message: "No users found with that ID",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Users retrieved successfully",
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
