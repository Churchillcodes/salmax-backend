const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error("\n========== DATABASE CONNECTION ERROR ==========\n");

    console.error("Name:");
    console.error(err.name);

    console.error("\nMessage:");
    console.error(err.message);

    console.error("\nCause:");
    console.error(err.cause);

    console.error("\nReason:");
    console.error(err.reason);

    console.error("\nError Object:");
    console.error(err);

    console.error("\nStack:");
    console.error(err.stack);

    console.error("\n===============================================\n");

    process.exit(1);
  }
};

module.exports = connectDB;
