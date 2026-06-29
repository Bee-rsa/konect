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

const registerCompanyWithMaster = async (req, res) => {
  try {
    const {
      companyName,
      businessType,
      cipcNumber,
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

    const existingCompany = await Company.findOne({ cipcNumber });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Email stays globally unique
    const existingEmail = await CompanyUser.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const company = await Company.create({
      companyName,
      businessType,
      cipcNumber,
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

    // Username only needs to be unique within this company
    const existingUsernameInCompany = await CompanyUser.findOne({
      company: company._id,
      username,
    });

    if (existingUsernameInCompany) {
      return res.status(400).json({
        message: "Username already exists in this company",
      });
    }

    // Safety: ensure only one master holder per company
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
      user: masterUser,
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
      user: companyUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerCompanyWithMaster,
  loginCompanyUser,
};