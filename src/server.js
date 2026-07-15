require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/dbConn");

const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// Wait for database connection before opening the server to traffic
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
