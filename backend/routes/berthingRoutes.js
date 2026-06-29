const express = require("express");
const router = express.Router();
const {
  createBerthing,
  getAllBerthings,
  getBerthingById,
  updateBerthing,
  deleteBerthing,
  getBerthingsByPort,
  getVesselVisitHistory,
} = require("../controllers/berthingController");

router.post("/", createBerthing);
router.get("/", getAllBerthings);
router.get("/port/:country/:portCode", getBerthingsByPort);
router.get("/vessel/:vesselId/history", getVesselVisitHistory);
router.get("/:id", getBerthingById);
router.put("/:id", updateBerthing);
router.delete("/:id", deleteBerthing);

module.exports = router;