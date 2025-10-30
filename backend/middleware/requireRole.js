export const requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: "fail", message: "Unauthorized: No user data found" });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({ 
        status: "fail", 
        message: `Access restricted: Allowed role is "${allowedRole}"` 
      });
    }

    next();
  };
};
