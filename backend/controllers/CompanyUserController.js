const CompanyUser = require("../models/CompanyUser");
const Branch = require("../models/Branch");
const ActivityLog = require("../models/ActivityLog");
const generateUserId = require("../utils/generateUserId");

const createCompanyUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      region,
      branchId,
      department,
      jobTitle,
      role,
      permissions,
    } = req.body;

    if (
      req.companyUser.role !== "master_holder" &&
      req.companyUser.role !== "branch_admin"
    ) {
      return res.status(403).json({ message: "Only admins can create users" });
    }

    const existingUser = await CompanyUser.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const userId = await generateUserId({
      companyName: req.companyUser.companyName,
      countryCode: req.companyUser.country === "South Africa" ? "ZA" : "GL",
      branchCode:
        branch.branchName.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "MB",
      User: CompanyUser,
    });

    const newUser = await CompanyUser.create({
      firstName,
      lastName,
      username,
      email,
      password,
      userId,
      company: req.companyUser.company._id,
      companyName: req.companyUser.companyName,
      country: req.companyUser.country,
      region,
      branch: branch._id,
      branchName: branch.branchName,
      department,
      jobTitle,
      role: role || "user",
      permissions: permissions || [],
      createdBy: req.companyUser._id,
    });

    const populatedUser = await CompanyUser.findById(newUser._id)
      .populate("company")
      .populate("branch");

    await ActivityLog.create({
      company: req.companyUser.company._id,
      branch: req.companyUser.branch?._id || null,
      user: req.companyUser._id,
      userIdText: req.companyUser.userId,
      username: req.companyUser.username,
      module: "Master Control",
      service: "Users",
      action: "create",
      message: `${req.companyUser.username} created user ${newUser.username}`,
      meta: {
        createdUserId: newUser._id,
        createdUserUserId: newUser.userId,
        role: newUser.role,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
      user: populatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCompanyUsers = async (req, res) => {
  try {
    const users = await CompanyUser.find({ company: req.companyUser.company._id })
      .select(
        "firstName lastName username email userId role region branchName jobTitle department isActive createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ company: req.companyUser.company._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompanyUser,
  getCompanyUsers,
  getRecentActivity,
};