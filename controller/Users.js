import { Users } from "../models/Users.js";
import { UsersToken } from "../models/UsersToken.js";
import { UsersLocations } from "../models/UsersLocation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto-js";
import generateUserCode from "../config/Function.js";
import { Op } from "sequelize";

const signToken = (user) => {
  return jwt.sign(
    {
      Id: user.Id,
      email: user.Email,
      iat: Math.floor(Date.now() / 1000),
      iss: "https://skyparking.online",
      role: user.Role,
      sub: user.Username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  res.cookie("refreshToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    sameSite: "None",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    message: "Login berhasil",
  });
};

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["Id", "Name", "Email", "Username", "Password"],
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ msg: "Terjadi kesalahan saat mengambil data pengguna" });
  }
};

export const register = async (req, res) => {
  const {
    SetupRoleId,
    IpAddress,
    Name,
    Gender,
    Birthdate,
    Username,
    Email,
    Phone,
    HandPhone,
    Whatsapp,
    Photo,
    IsFirstpassword,
    FlagAllLocation,
    MerchantId,
    LocationCode, // array of location codes
    CreatedBy,
  } = req.body;
  const password = "sky123";
  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const currentDate = new Date();
    const oneYearLater = new Date(
      currentDate.getFullYear() + 1,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const lastUsers = await Users.findOne({
      order: [["Id", "DESC"]],
    });

    const lastId = lastUsers ? lastUsers.Id : 0;
    const userCode = await generateUserCode(lastId);
    const newUser = await Users.create({
      SetupRoleId: SetupRoleId,
      IpAddress: IpAddress,
      Name: Name,
      UserCode: userCode,
      Gender: Gender,
      Birthdate: Birthdate,
      Username: Username,
      Email: Email,
      Password: hashPassword,
      Phone: Phone,
      HandPhone: HandPhone,
      Whatsapp: Whatsapp,
      Photo: Photo,
      PasswordExpired: oneYearLater,
      IsFirstpassword: IsFirstpassword,
      FlagAllLocation: FlagAllLocation,
      MerchantId: MerchantId,
      CreatedBy: CreatedBy,
    });

    if (!Array.isArray(LocationCode)) {
      return res.status(400).json({ msg: "LocationCode harus berupa array" });
    }

    const data = LocationCode.map((location) => ({
      UserId: newUser.Id,
      LocationCode: location,
      CreatedBy: CreatedBy, // use the CreatedBy from req.body
    }));

    await UsersLocations.bulkCreate(data);

    res.json({ msg: "Register berhasil" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat registrasi" });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        status: "fail",
        message:
          "Harap masukkan identifier (username, email, atau nomor telepon) dan password!",
      });
    }

    const user = await Users.findOne({
      where: {
        [Op.or]: [
          { Username: identifier },
          { Email: identifier },
          { Phone: identifier },
        ],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.Password))) {
      return res.status(401).json({
        status: "fail",
        message: "Identifier atau password tidak sesuai",
      });
    }

    user.LastLogin = new Date();
    await user.save({ validate: false });

    createSendToken(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat login" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await UsersToken.findAll({
      where: {
        RefreshToken: refreshToken,
      },
    });

    if (user.length === 0) return res.sendStatus(204);

    const userId = user[0].UserId;
    await UsersToken.update(
      { RefreshToken: null },
      {
        where: {
          UserId: userId,
        },
      }
    );

    res.clearCookie("refreshToken");
    res.sendStatus(200);
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat logout" });
  }
};
