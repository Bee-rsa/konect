const mongoose = require("mongoose");

const caseStudySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    publishDate: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    readingTime: {
      type: String,
      default: "",
      trim: true,
    },
    totalReadTimeSeconds: {
    type: Number,
    default: 0,
    min: 0,
    },
    readCount: {
    type: Number,
    default: 0,
    min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    featuredImage: {
      type: String,
      default: "",
    },
    designTemplate: {
      type: String,
      enum: ["editorial", "insight", "report"],
      default: "editorial",
    },
    content: {
      introduction: { type: String, default: "" },
      backgroundContext: { type: String, default: "" },
      problemStatement: { type: String, default: "" },
      objectives: { type: String, default: "" },
      methodology: { type: String, default: "" },
      analysisBody: { type: String, default: "" },
      keyFindings: { type: String, default: "" },
      recommendations: { type: String, default: "" },
      conclusion: { type: String, default: "" },
    },
    settings: {
      featured: { type: Boolean, default: false },
      published: { type: Boolean, default: false, index: true },
      showAuthor: { type: Boolean, default: true },
      showRegion: { type: Boolean, default: true },
      allowHighlights: { type: Boolean, default: true },
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

caseStudySchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = generateSlug(this.title);
  }
  next();
});

caseStudySchema.index({ slug: 1 });
caseStudySchema.index({ createdAt: -1 });
caseStudySchema.index({ views: -1 });
caseStudySchema.index({ category: 1 });
caseStudySchema.index({ region: 1 });
caseStudySchema.index({ "settings.published": 1, createdAt: -1 });

module.exports = mongoose.model("CaseStudy", caseStudySchema);