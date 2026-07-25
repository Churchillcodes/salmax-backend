const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const app = express();
const logger = require("./middleware/logger");
const cookieParser = require("cookie-parser");

app.use(cors(corsOptions));
// 1. Global Middleware
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

// 3. Exporting the app instance
module.exports = app;
