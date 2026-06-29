const User = require("../models/User");
const TerminalBerthing = require("../models/Berthing");
const CaseStudy = require("../models/CaseStudy");
const AnalyticsEvent = require("../models/AnalyticsEvent");

const COUNTRY_CODE_TO_NAME = {
  ZA: "South Africa",
  NA: "Namibia",
  MZ: "Mozambique",
  TZ: "Tanzania",
  AO: "Angola",
};

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

const getAdminDashboardAnalytics = async (req, res) => {
  try {
    const startOfWeek = getStartOfWeek();
    const countryCode = req.query.country || "";
    const countryName = countryCode ? COUNTRY_CODE_TO_NAME[countryCode] : "";

    const vesselCountryFilter = countryName
      ? { destinationCountry: countryName }
      : {};

    const [
      totalRegisteredUsers,
      usersRegisteredThisWeek,
      siteVisitsThisWeek,
      searchesThisWeek,
      returningUsersAgg,
      deviceSplitAgg,
      pageUsageAgg,
      totalRegisteredVessels,
      vesselsAddedThisWeek,
      mostSearchedPortAgg,
      vesselsPerTerminalAgg,
      totalCaseStudies,
      topViewedCaseStudies,
      caseStudyViewsThisWeekAgg,
      avgReadTimeAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),

      AnalyticsEvent.countDocuments({
        eventType: "visit",
        createdAt: { $gte: startOfWeek },
      }),

      AnalyticsEvent.countDocuments({
        eventType: "search",
        createdAt: { $gte: startOfWeek },
      }),

      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        {
          $group: {
            _id: "$sessionId",
            eventCount: { $sum: 1 },
          },
        },
        { $match: { eventCount: { $gt: 1 } } },
        { $count: "count" },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        {
          $group: {
            _id: "$deviceType",
            count: { $sum: 1 },
          },
        },
      ]),

      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "page_view",
            createdAt: { $gte: startOfWeek },
            page: { $in: ["weight-calculator", "case-studies", "terminal-berthing"] },
          },
        },
        {
          $group: {
            _id: "$page",
            count: { $sum: 1 },
          },
        },
      ]),

      TerminalBerthing.countDocuments(vesselCountryFilter),

      TerminalBerthing.countDocuments({
        ...vesselCountryFilter,
        createdAt: { $gte: startOfWeek },
      }),

      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "search",
            createdAt: { $gte: startOfWeek },
            ...(countryCode ? { countryCode } : {}),
            portName: { $ne: "" },
          },
        },
        {
          $group: {
            _id: "$portName",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      TerminalBerthing.aggregate([
        { $match: vesselCountryFilter },
        {
          $group: {
            _id: "$berthingShed",
            vessels: { $sum: 1 },
          },
        },
        { $sort: { vessels: -1, _id: 1 } },
      ]),

      CaseStudy.countDocuments(),

      CaseStudy.find({})
        .sort({ views: -1, createdAt: -1 })
        .limit(3)
        .select("title slug views"),

      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "page_view",
            page: "case-studies",
            createdAt: { $gte: startOfWeek },
          },
        },
        { $count: "count" },
      ]),

      CaseStudy.aggregate([
        {
          $project: {
            avgReadTimeSeconds: {
              $cond: [
                { $gt: ["$readCount", 0] },
                { $divide: ["$totalReadTimeSeconds", "$readCount"] },
                0,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageReadTimeSeconds: { $avg: "$avgReadTimeSeconds" },
          },
        },
      ]),
    ]);

    const deviceSplit = {
      mobile: 0,
      tablet: 0,
      desktop: 0,
      unknown: 0,
    };

    deviceSplitAgg.forEach((item) => {
      if (item._id in deviceSplit) {
        deviceSplit[item._id] = item.count;
      }
    });

    const pageUsageMap = {
      "weight-calculator": 0,
      "case-studies": 0,
      "terminal-berthing": 0,
    };

    pageUsageAgg.forEach((item) => {
      pageUsageMap[item._id] = item.count;
    });

    const pageUsage = [
      { name: "Volumetric Weight", value: pageUsageMap["weight-calculator"] },
      { name: "Case Studies", value: pageUsageMap["case-studies"] },
      { name: "Terminal Berthing", value: pageUsageMap["terminal-berthing"] },
    ];

    const vesselsPerTerminal = vesselsPerTerminalAgg.map((item) => ({
      terminalName: item._id || "Unknown",
      vessels: item.vessels,
    }));

    const averageReadTimeSeconds =
      avgReadTimeAgg?.[0]?.averageReadTimeSeconds || 0;

    res.json({
      users: {
        totalRegisteredUsers,
        usersRegisteredThisWeek,
        siteVisitsThisWeek,
        searchesThisWeek,
        returningUsers: returningUsersAgg?.[0]?.count || 0,
        deviceSplit,
        pageUsage,
      },
      terminalBerthing: {
        totalRegisteredVessels,
        mostSearchedPort: mostSearchedPortAgg?.[0]?._id || "N/A",
        vesselsAddedThisWeek,
        vesselsPerTerminal,
      },
      caseStudies: {
        totalCaseStudies,
        topViewedCaseStudies,
        viewsThisWeek: caseStudyViewsThisWeekAgg?.[0]?.count || 0,
        averageReadTimeSeconds,
      },
    });
  } catch (error) {
    console.error("getAdminDashboardAnalytics error:", error);
    res.status(500).json({ message: "Failed to load admin analytics" });
  }
};

module.exports = {
  getAdminDashboardAnalytics,
};