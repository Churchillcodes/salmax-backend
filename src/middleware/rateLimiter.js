const rateLimit = require("express-rate-limit");

// Protects /auth/login and /auth/register from brute-force/credential-stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
