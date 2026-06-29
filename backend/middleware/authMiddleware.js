const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded?.user?.id || decoded?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Not authorized as an admin" });
};

const company = (req, res, next) => {
  if (req.user && req.user.role === "company") {
    return next();
  }
  return res.status(403).json({ message: "Not authorized as a company" });
};

const customerOrCompany = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "customer" || req.user.role === "company")
  ) {
    return next();
  }

  return res.status(403).json({ message: "Not authorized" });
};

module.exports = { protect, admin, company, customerOrCompany };