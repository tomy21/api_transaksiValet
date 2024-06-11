import { Users } from "../models/Users.js";
import { UsersToken } from "../models/UsersToken.js";
import { UsersLocations } from "../models/UsersLocation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto-js";
import generateUserCode from "../config/Function.js";
const secretKey = "PARTNER_KEY";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["Id", "Name", "Email", "Username", "Password"],
    });
    res.json(users);
  } catch (error) {
    console.log(error);
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
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  const currentDate = new Date();
  const oneYearLater = new Date(
    currentDate.getFullYear() + 1,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  try {
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

    console.log(newUser.Id);
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
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan" });
  }
};

export const login = async (req, res) => {
  const encryptedData = req.body.data;
  const decryptedResult = crypto.AES.decrypt(encryptedData, secretKey).toString(
    crypto.enc.Utf8
  );
  const decryptedObject = JSON.parse(decryptedResult);
  const emailUser = decryptedObject.email;
  const password = decryptedObject.password;
  try {
    const user = await Users.findAll({
      where: {
        Email: emailUser,
      },
    });
    const userLocation = await UsersLocations.findAll({
      where: {
        UserId: user[0].Id,
      },
    });

    const match = await bcrypt.compare(password, user[0].Password);
    if (!match) return res.status(400).json({ msg: "Password tidak valid" });
    const userId = user[0].Id;
    const name = user[0].Name;
    const email = user[0].Email;
    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15s",
      }
    );

    const refreshToken = jwt.sign(
      { userId, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const tokenUsers = await UsersToken.findAll({
      where: {
        UserId: userId,
      },
    });
    if (tokenUsers == "") {
      await UsersToken.create({
        UserId: userId,
        OperatingSystem: "Website",
        App: "Valet",
        TokenFCM: null,
        RefreshToken: null,
        Detail_Device: null,
        Version: null,
      });
    }

    await UsersToken.update(
      { RefreshToken: refreshToken },
      {
        where: {
          UserId: userId,
        },
      }
    );

    await Users.update(
      { LastActivity: new Date() },
      {
        where: {
          Id: userId,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      domain: ".skyparking.online",
      sameSite: "None",
      secure: true,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({ msg: "Email tidak valid" });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) return res.sendStatus(204);
  const user = await UsersToken.findAll({
    where: {
      RefreshToken: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].Id;
  await UsersToken.update(
    { RefreshToken: null },
    {
      where: {
        Id: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  res.sendStatus(200);
};
