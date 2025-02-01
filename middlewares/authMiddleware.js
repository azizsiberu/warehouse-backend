// middleware/authMiddleware.js
const { verifyToken } = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.error("❌ Token tidak ditemukan!");
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      console.error("❌ Token tidak memiliki ID:", decoded);
      return res.status(403).json({ message: "Token tidak valid" });
    }

    req.user = decoded; // Simpan user ke request
    console.log("✅ Token valid untuk user:", decoded.id);
    next();
  } catch (error) {
    console.error("❌ Gagal mendekode token:", error);
    return res.status(403).json({ message: "Token tidak valid" });
  }
};

module.exports = authMiddleware;
