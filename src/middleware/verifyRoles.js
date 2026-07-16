const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req?.roles?.length) {
        return res.status(401).json({ message: "Roles not found on request" });
      }
      const result = req.roles.some((role) => allowedRoles.includes(role));

      if (!result) {
        return res.status(403).json({
          message: "You do not have permission to access this resource",
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
};

module.exports = verifyRoles;
