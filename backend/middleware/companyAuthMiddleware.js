const jwt = require("jsonwebtoken");
const CompanyUser = require("../models/CompanyUser");

const protectCompanyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support both token shapes
    const userId =
      decoded.companyUserId ||
      decoded?.user?.id ||
      decoded?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const companyUser = await CompanyUser.findById(userId)
      .populate("company")
      .populate("branch");

    if (!companyUser) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Set both so existing code still works
    req.user = companyUser;
    req.companyUser = companyUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const companyAdminOrMaster = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "master_holder" || req.user.role === "branch_admin")
  ) {
    return next();
  }
  return res.status(403).json({ message: "Not authorized as admin" });
};

module.exports = { protectCompanyUser, companyAdminOrMaster };