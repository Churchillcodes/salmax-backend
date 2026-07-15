const express = require("express");
const cors = require("cors");
const app = express();
const logger = require("./middleware/logger");
const cookieParser = require("cookie-parser");

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Crucial for cookies/sessions/auth headers
    optionsSuccessStatus: 200,
  }),
);
// 1. Global Middleware
app.use(logger);
app.use(express.json());
app.use(cookieParser());

// 2. Routes
app.use("/", require("./routes/root"));
// 3. Exporting the app instance
module.exports = app;
