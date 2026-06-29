const jwt = require("jsonwebtoken");
const User = require("../models/CompanyUser");
const ActivityLog = require("../models/ActivityLog");

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const loginCompanyUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    })
      .populate("company")
      .populate("branch");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    await ActivityLog.create({
      company: user.company._id,
      branch: user.branch?._id || null,
      user: user._id,
      userIdText: user.userId,
      username: user.username,
      module: "Auth",
      service: "Login",
      action: "login",
      message: `${user.firstName} ${user.lastName} logged in`,
      meta: {
        email: user.email,
        role: user.role,
      },
    });

    return res.status(200).json({
      token: createToken(user._id),
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { loginCompanyUser };