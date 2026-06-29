const jwt    = require("jsonwebtoken");
const Driver = require("../models/Driver");

const protectDriver = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const driver  = await Driver.findById(decoded.driverId).select("-password");

    if (!driver) {
      return res.status(401).json({ message: "Driver not found" });
    }

    if (driver.status === "suspended") {
      return res.status(403).json({ message: "Account suspended. Contact support." });
    }

    req.driver = driver;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const requireApproved = (req, res, next) => {
  if (!req.driver.isActive || req.driver.status === "pending") {
    return res.status(403).json({
      message: "Account pending approval. You will be notified once verified.",
    });
  }
  next();
};

module.exports = { protectDriver, requireApproved };