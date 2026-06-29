const express = require("express");
const {
  registerCompanyWithMaster,
  loginCompanyUser,
} = require("../controllers/companyController");

const router = express.Router();

router.post("/register", registerCompanyWithMaster);
router.post("/login", loginCompanyUser);

module.exports = router;