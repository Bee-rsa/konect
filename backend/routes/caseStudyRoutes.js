const express = require("express");
const router = express.Router();
const {
  createCaseStudy,
  getAllCaseStudies,
  getCaseStudyBySlug,
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
  incrementCaseStudyViews,
  recordCaseStudyReadTime,
} = require("../controllers/caseStudyController");

router.post("/", createCaseStudy);
router.get("/", getAllCaseStudies);
router.get("/slug/:slug", getCaseStudyBySlug);
router.get("/:id", getCaseStudyById);
router.put("/:id", updateCaseStudy);
router.delete("/:id", deleteCaseStudy);
router.put("/slug/:slug/view", incrementCaseStudyViews);
router.put("/slug/:slug/read-time", recordCaseStudyReadTime);

module.exports = router;