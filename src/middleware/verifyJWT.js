const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(401);
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = verifyJWT;
