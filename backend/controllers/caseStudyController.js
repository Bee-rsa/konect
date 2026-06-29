const CaseStudy = require("../models/CaseStudy");

const createCaseStudy = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      views: req.body.views ?? 0,
      totalReadTimeSeconds: req.body.totalReadTimeSeconds ?? 0,
      readCount: req.body.readCount ?? 0,
    };

    const newCaseStudy = new CaseStudy(payload);
    const savedCaseStudy = await newCaseStudy.save();

    res.status(201).json(savedCaseStudy);
  } catch (error) {
    console.error("createCaseStudy error:", error);
    res.status(500).json({
      message: "Failed to create case study",
      error: error.message,
    });
  }
};

const getAllCaseStudies = async (req, res) => {
  try {
    const {
      published,
      sortBy = "newest",
      limit = 12,
      category,
      region,
      search,
    } = req.query;

    console.log("GET /api/case-studies hit");
    console.log("Query params:", req.query);

    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 24);

    const filter = {};

    if (published === "true") {
      filter["settings.published"] = true;
    }

    if (category) {
      filter.category = category;
    }

    if (region) {
      filter.region = region;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { title: regex },
        { subtitle: regex },
        { description: regex },
      ];
    }

    let sort = { createdAt: -1 };

    if (sortBy === "mostViewed") {
      sort = { views: -1, createdAt: -1 };
    } else if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    }

    console.log("Filter:", filter);
    console.log("Sort:", sort);
    console.log("Limit:", safeLimit);
    console.log("About to query Mongo...");

    const caseStudies = await CaseStudy.find(filter)
      .select("_id title slug description author category region createdAt")
      .sort(sort)
      .limit(safeLimit)
      .lean()
      .maxTimeMS(3000);

    console.log("Fetched case studies:", caseStudies.length);

    res.status(200).json({
      caseStudies,
      count: caseStudies.length,
    });
  } catch (error) {
    console.error("getAllCaseStudies error:", error);
    res.status(500).json({
      message: "Failed to fetch case studies",
      error: error.message,
    });
  }
};

const getCaseStudyBySlug = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOne({ slug: req.params.slug })
      .lean()
      .maxTimeMS(8000);

    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    res.status(200).json(caseStudy);
  } catch (error) {
    console.error("getCaseStudyBySlug error:", error);
    res.status(500).json({
      message: "Failed to fetch case study",
      error: error.message,
    });
  }
};

const getCaseStudyById = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id)
      .lean()
      .maxTimeMS(8000);

    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    res.status(200).json(caseStudy);
  } catch (error) {
    console.error("getCaseStudyById error:", error);
    res.status(500).json({
      message: "Failed to fetch case study",
      error: error.message,
    });
  }
};

const updateCaseStudy = async (req, res) => {
  try {
    const updatedCaseStudy = await CaseStudy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).maxTimeMS(8000);

    if (!updatedCaseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    res.status(200).json(updatedCaseStudy);
  } catch (error) {
    console.error("updateCaseStudy error:", error);
    res.status(500).json({
      message: "Failed to update case study",
      error: error.message,
    });
  }
};

const deleteCaseStudy = async (req, res) => {
  try {
    const deletedCaseStudy = await CaseStudy.findByIdAndDelete(
      req.params.id
    ).maxTimeMS(8000);

    if (!deletedCaseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    res.status(200).json({ message: "Case study deleted successfully" });
  } catch (error) {
    console.error("deleteCaseStudy error:", error);
    res.status(500).json({
      message: "Failed to delete case study",
      error: error.message,
    });
  }
};

const incrementCaseStudyViews = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .select("_id slug views")
      .lean()
      .maxTimeMS(8000);

    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    res.status(200).json(caseStudy);
  } catch (error) {
    console.error("incrementCaseStudyViews error:", error);
    res.status(500).json({
      message: "Failed to increment case study views",
      error: error.message,
    });
  }
};

const recordCaseStudyReadTime = async (req, res) => {
  try {
    const seconds = Number(req.body.seconds || 0);

    if (!seconds || seconds < 1) {
      return res.status(400).json({
        message: "Valid read time in seconds is required",
      });
    }

    const caseStudy = await CaseStudy.findOneAndUpdate(
      { slug: req.params.slug },
      {
        $inc: {
          totalReadTimeSeconds: seconds,
          readCount: 1,
        },
      },
      { new: true }
    )
      .select("_id slug totalReadTimeSeconds readCount")
      .lean()
      .maxTimeMS(8000);

    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    res.status(200).json(caseStudy);
  } catch (error) {
    console.error("recordCaseStudyReadTime error:", error);
    res.status(500).json({
      message: "Failed to record case study read time",
      error: error.message,
    });
  }
};

module.exports = {
  createCaseStudy,
  getAllCaseStudies,
  getCaseStudyBySlug,
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
  incrementCaseStudyViews,
  recordCaseStudyReadTime,
};