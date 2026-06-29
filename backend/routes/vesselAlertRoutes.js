const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createVesselBerthAlert,
  deleteVesselBerthAlert,
  getMyVesselAlerts,
} = require("../controllers/vesselAlertController");

router.post("/", protect, createVesselBerthAlert);
router.get("/my-alerts", protect, getMyVesselAlerts);
router.delete("/:id", protect, deleteVesselBerthAlert);

module.exports = router;