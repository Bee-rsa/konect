const express = require("express");
const router = express.Router();
const {
  protectCompanyUser,
  companyAdminOrMaster,
} = require("../middleware/companyAuthMiddleware");
const {
  createCompanyUser,
  getCompanyUsers,
  getRecentActivity,
} = require("../controllers/CompanyUserController");

router.post("/", protectCompanyUser, companyAdminOrMaster, createCompanyUser);
router.get("/", protectCompanyUser, getCompanyUsers);
router.get("/recent-activity", protectCompanyUser, getRecentActivity);

module.exports = router;


