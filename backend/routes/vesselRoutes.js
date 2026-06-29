const express = require("express");
const router = express.Router();
const {
  createVessel,
  getAllVessels,
  searchVessels,
  getVesselById,
  getVesselBySlug,
  updateVessel,
  deleteVessel,
} = require("../controllers/vesselController");

router.post("/", createVessel);
router.get("/", getAllVessels);
router.get("/search", searchVessels);
router.get("/slug/:slug", getVesselBySlug);
router.get("/:id", getVesselById);
router.put("/:id", updateVessel);
router.delete("/:id", deleteVessel);

module.exports = router;