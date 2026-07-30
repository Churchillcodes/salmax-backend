require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/dbConn");

const PORT = process.env.PORT || 3500;

console.log("========== ENVIRONMENT ==========");
console.log("Node:", process.version);

console.log("Mongoose:", require("mongoose/package.json").version);

try {
  console.log("MongoDB Driver:", require("mongodb/package.json").version);
} catch (err) {
  console.log("MongoDB Driver: Unable to determine version");
}

console.log("=================================");

// Connect to MongoDB
connectDB();

// Wait for database connection before opening the server to traffic
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
