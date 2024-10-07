import jwt from "jsonwebtoken";
import { Users } from "../models/OCC/Users.js";

export const protectAuth = async (req, res, next) => {
  let token;

  // Pastikan Anda menggunakan nama cookie yang benar ('refreshToken' dalam hal ini)
  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in! Please log in to get access.",
    });
  }

  try {
    // Verifikasi token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.Id;
    // Cari user berdasarkan ID yang ada di token
    const currentUser = await Users.findByPk(decoded.Id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Simpan data user yang terverifikasi ke req.user untuk digunakan di rute selanjutnya
    req.user = currentUser;
    next(); // Lanjut ke handler berikutnya
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or token has expired.",
    });
  }
};
