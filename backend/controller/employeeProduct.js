import Product from "../model/product.js";
import User from "../model/user.js";

export const getEmployeeProducts = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);

    if (!employee || employee.role !== "employee") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const manager = await User.findById(employee.managerId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(404)
        .json({ message: "Manager not found for this employee" });
    }

    const orgAdminId = manager.organizationAdminId;
    if (!orgAdminId) {
      return res
        .status(404)
        .json({ message: "OrgAdmin not linked to this manager" });
    }

    const products = await Product.find({ createdBy: orgAdminId })
      .populate("category")
      .populate("createdBy", "firstName lastName email role")
      .sort({ name: 1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch employee products",
      error: err.message,
    });
  }
};
