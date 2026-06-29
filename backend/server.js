const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cron = require("node-cron");
const { createServer } = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoute = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoutes");
const caseStudyRoutes = require("./routes/caseStudyRoutes");
const vesselRoutes = require("./routes/vesselRoutes");
const berthingRoutes = require("./routes/berthingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const vesselAlertRoutes = require("./routes/vesselAlertRoutes");
const companyRateRoutes = require("./routes/companyRateRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const companyRoutes = require("./routes/companyRoutes");
const authRoutes = require("./routes/authRoutes");
const companyUserRoutes = require("./routes/companyUserRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");

const driverAuthRoutes    = require("./routes/driverAuthRoutes");
const rideRoutes          = require("./routes/rideRoutes");
const liftClubRoutes      = require("./routes/liftClubRoutes");
const liftClubLeaseRoutes = require("./routes/liftClubLeaseRoutes");
const adminDriverRoutes   = require("./routes/adminDriverRoutes");

const runVesselBerthNotificationJob = require("./jobs/vesselBerthNotificationJob");
const { matchRide } = require("./services/matchingService");

dotenv.config();

const app        = express();
const httpServer = createServer(app);
const PORT       = process.env.PORT || 3000;

mongoose.set("bufferCommands", false);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on("driver:join", ({ driverId }) => {
    socket.join(`driver:${driverId}`);
    console.log(`[Socket] Driver ${driverId} joined room`);
  });

  socket.on("driver:leave", ({ driverId }) => {
    socket.leave(`driver:${driverId}`);
    console.log(`[Socket] Driver ${driverId} left room`);
  });

  // ── Customer joins their personal room to receive lease responses ──
  socket.on("user:join", ({ userId }) => {
    socket.join(`user:${userId}`);
    console.log(`[Socket] User ${userId} joined room`);
  });

  socket.on("ride:join", ({ rideId }) => {
    socket.join(`ride:${rideId}`);
    console.log(`[Socket] Customer joined ride room: ${rideId}`);
  });

  socket.on("ride:leave", ({ rideId }) => {
    socket.leave(`ride:${rideId}`);
  });

  socket.on("driver:location_update", ({ rideId, driverId, coordinates }) => {
    socket.to(`ride:${rideId}`).emit("driver:location_update", {
      driverId,
      coordinates,
    });
  });

  socket.on("ride:new_request_internal", async ({ rideId }) => {
    console.log(`[Socket] Starting match for ride: ${rideId}`);
    try {
      await matchRide(io, rideId);
    } catch (error) {
      console.error(`[Matching] Error for ride ${rideId}:`, error.message);
    }
  });

  socket.on("ride:decline", ({ rideId, driverId }) => {
    console.log(`[Socket] Driver ${driverId} declined ride ${rideId}`);
  });

  socket.on("liftclub:join", ({ liftClubId }) => {
    socket.join(`liftclub:${liftClubId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => res.send("WELCOME TO Cargo Konect!"));
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message:    "Server is running",
    mongoState: mongoose.connection.readyState,
    socketio:   "active",
  });
});

app.use("/api/users",             userRoutes);
app.use("/api/upload",            uploadRoutes);
app.use("/api",                   subscribeRoute);
app.use("/api/case-studies",      caseStudyRoutes);
app.use("/api/vessels",           vesselRoutes);
app.use("/api/berthings",         berthingRoutes);
app.use("/api/analytics",         analyticsRoutes);
app.use("/api/admin/analytics",   adminAnalyticsRoutes);
app.use("/api/notifications",     notificationRoutes);
app.use("/api/vessel-alerts",     vesselAlertRoutes);
app.use("/api/company-rates",     companyRateRoutes);
app.use("/api/quotes",            quoteRoutes);
app.use("/api/company",           companyRoutes);
app.use("/api/auth",              authRoutes);
app.use("/api/company-users",     companyUserRoutes);
app.use("/api/favourites",        favouriteRoutes);
app.use("/api/admin/users",       adminRoutes);

app.use("/api/driver",            driverAuthRoutes);
app.use("/api/rides",             rideRoutes);
app.use("/api/lift-clubs",        liftClubRoutes);
app.use("/api/lift-clubs",        liftClubLeaseRoutes);
app.use("/api/admin/drivers",     adminDriverRoutes);

const startServer = async () => {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected");
    }

    console.log("MongoDB connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Socket.io active on port ${PORT}`);
    });

    cron.schedule("* * * * *", async () => {
      await runVesselBerthNotificationJob();
    });

    console.log("Vessel berth notification job scheduled.");
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();