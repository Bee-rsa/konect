const express = require("express");
const router = express.Router();

const Company = require("../models/Company");
const Branch = require("../models/Branch");
const CompanyUser = require("../models/CompanyUser");
const generateUserId = require("../utils/generateUserId");
const jwt = require("jsonwebtoken");

const createCompanyToken = (companyUserId) => {
  return jwt.sign({ companyUserId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const protectCompanyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const companyUser = await CompanyUser.findById(decoded.companyUserId)
      .populate("company")
      .populate("branch");

    if (!companyUser) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = companyUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const registerCompanyWithMaster = async (req, res) => {
  try {
    const {
      companyName,
      businessType,
      businessRegistrationNumber,
      taxNumber,
      location,
      country,
      region,
      branchName,
      firstName,
      lastName,
      username,
      email,
      password,
      jobTitle,
    } = req.body;

    const existingCompany = await Company.findOne({
      cipcNumber: businessRegistrationNumber,
    });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const existingEmail = await CompanyUser.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const company = await Company.create({
      companyName,
      businessType,
      cipcNumber: businessRegistrationNumber,
      taxNumber,
      location,
      country,
      regions: [region],
    });

    const branch = await Branch.create({
      company: company._id,
      country,
      region,
      branchName,
      isHeadOffice: true,
    });

    const existingUsernameInCompany = await CompanyUser.findOne({
      company: company._id,
      username,
    });

    if (existingUsernameInCompany) {
      return res.status(400).json({
        message: "Username already exists in this company",
      });
    }

    const existingMasterHolder = await CompanyUser.findOne({
      company: company._id,
      role: "master_holder",
    });

    if (existingMasterHolder) {
      return res.status(400).json({
        message: "This company already has a master holder",
      });
    }

    const userId = await generateUserId({
      companyName,
      companyId: company._id,
      countryCode: country === "South Africa" ? "ZA" : "GL",
      branchCode:
        branchName.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "MB",
      User: CompanyUser,
    });

    const masterUser = await CompanyUser.create({
      firstName,
      lastName,
      username,
      email,
      password,
      userId,
      company: company._id,
      companyName,
      country,
      region,
      branch: branch._id,
      branchName,
      department: "Management",
      jobTitle,
      role: "master_holder",
      permissions: [
        {
          module: "Operations",
          services: ["all"],
          actions: ["view", "create", "edit", "delete", "approve", "export"],
        },
        {
          module: "Rates",
          services: ["all"],
          actions: ["view", "create", "edit", "delete", "approve", "export"],
        },
        {
          module: "Intelligence",
          services: ["all"],
          actions: ["view", "create", "edit", "delete", "approve", "export"],
        },
        {
          module: "Management",
          services: ["all"],
          actions: ["view", "create", "edit", "delete", "approve", "export"],
        },
        {
          module: "Settings",
          services: ["all"],
          actions: ["view", "create", "edit", "delete", "approve", "export"],
        },
        {
          module: "Master Control",
          services: ["all"],
          actions: ["view", "create", "edit", "delete", "approve", "export"],
        },
      ],
      createdBy: null,
    });

    company.createdBy = masterUser._id;
    await company.save();

    return res.status(201).json({
      message: "Company and master holder created successfully",
      token: createCompanyToken(masterUser._id),
      user: {
        _id: masterUser._id,
        firstName: masterUser.firstName,
        lastName: masterUser.lastName,
        username: masterUser.username,
        email: masterUser.email,
        userId: masterUser.userId,
        company: company,
        companyName: masterUser.companyName,
        country: masterUser.country,
        region: masterUser.region,
        branch: branch,
        branchName: masterUser.branchName,
        department: masterUser.department,
        jobTitle: masterUser.jobTitle,
        role: masterUser.role,
        permissions: masterUser.permissions,
        favouriteServices: masterUser.favouriteServices,
        isActive: masterUser.isActive,
        lastLoginAt: masterUser.lastLoginAt,
        createdAt: masterUser.createdAt,
        updatedAt: masterUser.updatedAt,
      },
      company,
      branch,
    });
  } catch (error) {
    console.error("Company registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: `Duplicate field: ${Object.keys(error.keyValue).join(", ")}`,
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

const loginCompanyUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const companyUser = await CompanyUser.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    })
      .populate("company")
      .populate("branch");

    if (!companyUser || !(await companyUser.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!companyUser.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    companyUser.lastLoginAt = new Date();
    await companyUser.save();

    return res.status(200).json({
      token: createCompanyToken(companyUser._id),
      user: {
        _id: companyUser._id,
        firstName: companyUser.firstName,
        lastName: companyUser.lastName,
        username: companyUser.username,
        email: companyUser.email,
        userId: companyUser.userId,
        company: companyUser.company,
        companyName: companyUser.companyName,
        country: companyUser.country,
        region: companyUser.region,
        branch: companyUser.branch,
        branchName: companyUser.branchName,
        department: companyUser.department,
        jobTitle: companyUser.jobTitle,
        role: companyUser.role,
        permissions: companyUser.permissions,
        favouriteServices: companyUser.favouriteServices,
        isActive: companyUser.isActive,
        lastLoginAt: companyUser.lastLoginAt,
        createdAt: companyUser.createdAt,
        updatedAt: companyUser.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createCompanyUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      department,
      company,
      branch,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !role ||
      !department ||
      !company
    ) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    if (req.user.role !== "master_holder") {
      return res.status(403).json({ message: "Only master holder can create users" });
    }

    const existingEmail = await CompanyUser.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsernameInCompany = await CompanyUser.findOne({
      company,
      username: username.toLowerCase(),
    });

    if (existingUsernameInCompany) {
      return res.status(400).json({
        message: "Username already exists in this company",
      });
    }

    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({ message: "Company not found" });
    }

    let branchDoc = null;
    if (branch) {
      branchDoc = await Branch.findById(branch);
      if (!branchDoc) {
        return res.status(404).json({ message: "Branch not found" });
      }
    }

    const userId = await generateUserId({
      companyName: companyDoc.companyName,
      companyId: companyDoc._id,
      countryCode: companyDoc.country === "South Africa" ? "ZA" : "GL",
      branchCode:
        (branchDoc?.branchName || "MB").replace(/\s+/g, "").slice(0, 2).toUpperCase(),
      User: CompanyUser,
    });

    const newUser = await CompanyUser.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      userId,
      company: companyDoc._id,
      companyName: companyDoc.companyName,
      country: companyDoc.country,
      region: branchDoc?.region || req.user.region || "",
      branch: branchDoc?._id || null,
      branchName: branchDoc?.branchName || "",
      department,
      jobTitle: "",
      role,
      permissions: [],
      createdBy: req.user._id,
      isActive: true,
    });

    const populatedUser = await CompanyUser.findById(newUser._id)
      .populate("company")
      .populate("branch");

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: populatedUser._id,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        name: `${populatedUser.firstName} ${populatedUser.lastName}`,
        username: populatedUser.username,
        email: populatedUser.email,
        userId: populatedUser.userId,
        company: populatedUser.company,
        companyName: populatedUser.companyName,
        country: populatedUser.country,
        region: populatedUser.region,
        branch: populatedUser.branch,
        branchName: populatedUser.branchName,
        department: populatedUser.department,
        jobTitle: populatedUser.jobTitle,
        role: populatedUser.role,
        permissions: populatedUser.permissions,
        favouriteServices: populatedUser.favouriteServices,
        isActive: populatedUser.isActive,
        lastLoginAt: populatedUser.lastLoginAt,
        createdAt: populatedUser.createdAt,
        updatedAt: populatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create company user error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ROUTES
router.post("/register", registerCompanyWithMaster);
router.post("/login", loginCompanyUser);
router.post("/create-user", protectCompanyUser, createCompanyUser);

module.exports = router;