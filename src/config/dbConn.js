const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is undefined. Check your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
};

module.exports = connectDB;
