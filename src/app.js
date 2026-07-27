const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const logger = require("./middleware/logger");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");

// Railway (and most PaaS providers) sit behind a reverse proxy.
// This makes req.secure and req.ip work correctly, which matters
// for secure cookies and rate limiting.
app.set("trust proxy", 1);

app.use(cors(corsOptions));
// 1. Global Middleware
app.use(helmet());
app.use(logger);
app.use(express.json());
app.use(cookieParser());

// 2. Routes
app.use("/", require("./routes/root"));
app.use("/categories", require("./routes/categoryRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/sales", require("./routes/saleRoutes"));
app.use("/leads", require("./routes/leadRoutes"));
app.use("/auth", require("./routes/authRoutes"));

// 3. Global error handler (catches CORS rejection and anything else
// that reaches next(err) instead of being handled inside a controller)
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// 4. Exporting the app instance
module.exports = app;
