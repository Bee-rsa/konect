const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

const requireModuleAccess = (moduleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role === "master_holder") {
      return next();
    }

    const hasPermission = req.user.permissions.some(
      (permission) => permission.module === moduleName
    );

    if (!hasPermission) {
      return res.status(403).json({ message: `No access to ${moduleName}` });
    }

    next();
  };
};

module.exports = { requireRole, requireModuleAccess };