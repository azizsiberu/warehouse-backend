// middleware/authMiddleware.js
const { verifyToken } = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token tidak valid" });
  }
};

module.exports = authMiddleware;
