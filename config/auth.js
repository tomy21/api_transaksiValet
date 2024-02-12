const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const SECRET_KEY = "skyparking12345"; // Pastikan kunci rahasia Anda tetap rahasia

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
