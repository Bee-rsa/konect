const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  toggleFavouriteService,
  getFavouriteServices,
} = require("../controllers/favouriteController");

router.get("/", protect, getFavouriteServices);
router.put("/toggle", protect, toggleFavouriteService);

module.exports = router;