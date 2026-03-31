const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

/* ================================
   GLOBAL MIDDLEWARE
================================ */

// Keep security headers, but allow uploaded images to render cross-origin in the frontend.
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// 🔥 PROPER CORS CONFIG
const baseOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://hometown-hub-backend.onrender.com"
];

if (process.env.FRONTEND_URL) {
  baseOrigins.push(process.env.FRONTEND_URL);
}

const parsedAdditionalOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigins = Array.from(new Set([...baseOrigins, ...parsedAdditionalOrigins]));

const isVercelOrigin = (origin) => typeof origin === "string" && origin.includes(".vercel.app");

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (corsOrigins.includes(origin) || isVercelOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));

// Parse JSON body
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  })
);

// Logging
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/* ================================
   ROUTES
================================ */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/communities", require("./routes/communityRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/onboarding", require("./routes/onboardingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* ================================
   ROOT ROUTE
================================ */

app.get("/", (req, res) => {
  res.send("Hometown Hub API Running 🚀");
});

/* ================================
   404 HANDLER
================================ */

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Something went wrong",
    error: err.message
  });
});
module.exports = app;
