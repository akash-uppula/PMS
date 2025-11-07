import Order from "../model/order.js";
import User from "../model/user.js";
import bcrypt from "bcryptjs";

export const createManager = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const existingManager = await User.findOne({ email, role: "manager" });
    if (existingManager) {
      return res.status(400).json({
        status: "fail",
        message: "Manager with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newManager = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "manager",
      status: "Active",
      organizationAdminId: req.user._id,
    });

    const savedManager = await newManager.save();

    return res.status(201).json({
      status: "success",
      message: "Manager created successfully",
      data: {
        _id: savedManager._id,
        firstName: savedManager.firstName,
        lastName: savedManager.lastName,
        email: savedManager.email,
        role: savedManager.role,
        status: savedManager.status,
        organizationAdminId: savedManager.organizationAdminId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const updateManager = async (req, res) => {
  const { _id } = req.params;
  const { firstName, lastName, email, password } = req.body;

  try {
    const manager = await User.findById(_id);

    if (!manager || manager.role !== "manager") {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    if (manager.organizationAdminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You can only update your own managers",
      });
    }

    if (email && email !== manager.email) {
      const existingUser = await User.findOne({ email, role: "manager" });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          message: "Email already exists",
        });
      }
      manager.email = email;
    }

    if (firstName) manager.firstName = firstName;
    if (lastName) manager.lastName = lastName;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      manager.password = await bcrypt.hash(password, salt);
    }

    const updatedManager = await manager.save();

    return res.status(200).json({
      status: "success",
      message: "Manager updated successfully",
      data: {
        _id: updatedManager._id,
        firstName: updatedManager.firstName,
        lastName: updatedManager.lastName,
        email: updatedManager.email,
        role: updatedManager.role,
        status: updatedManager.status,
        organizationAdminId: updatedManager.organizationAdminId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const deleteManager = async (req, res) => {
  const { _id } = req.params;

  try {
    const manager = await User.findById(_id);

    if (!manager || manager.role !== "manager") {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    if (manager.organizationAdminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You can only delete your own managers",
      });
    }

    await manager.deleteOne();

    return res
      .status(200)
      .json({ status: "success", message: "Manager deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: "manager",
      organizationAdminId: req.user._id,
    })
      .select("-password")
      .sort({ firstName: 1, lastName: 1 });

    return res.status(200).json({
      status: "success",
      message: "Managers fetched successfully",
      results: managers.length,
      data: managers,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const toggleManagerStatus = async (req, res) => {
  try {
    const { _id } = req.params;

    const manager = await User.findById(_id);
    if (!manager || manager.role !== "manager") {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    if (manager.organizationAdminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You can only change status of your own managers",
      });
    }

    manager.status = manager.status === "Active" ? "Disabled" : "Active";
    const updatedManager = await manager.save();

    return res.status(200).json({
      status: "success",
      message: `Manager status updated to ${updatedManager.status}`,
      data: {
        _id: updatedManager._id,
        firstName: updatedManager.firstName,
        lastName: updatedManager.lastName,
        email: updatedManager.email,
        role: updatedManager.role,
        status: updatedManager.status,
        organizationAdminId: updatedManager.organizationAdminId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const markManagerAttendance = async (req, res) => {
  try {
    const managerId = req.user._id;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const manager = await User.findById(managerId).select("attendance role");
    if (!manager || manager.role !== "manager") {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    const existingRecord = manager.attendance.find(
      (record) => record.date.toISOString().split("T")[0] === todayStr
    );

    if (existingRecord) {
      return res.status(400).json({
        status: "fail",
        message: "Attendance already marked for today",
      });
    }

    manager.attendance.push({ date: today, status: "Present" });
    await manager.save();

    return res.status(200).json({
      status: "success",
      message: "Attendance marked successfully",
      attendance: manager.attendance,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const viewManagerAttendance = async (req, res) => {
  try {
    const { _id } = req.params;

    const manager = await User.findOne({
      _id,
      role: "manager",
    }).select("firstName lastName organizationAdminId attendance");

    if (!manager) {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    if (manager.organizationAdminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    return res.status(200).json({
      status: "success",
      message: "Attendance fetched successfully",
      manager: `${manager.firstName} ${manager.lastName}`,
      attendance: manager.attendance.sort((a, b) => b.date - a.date),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const updateManagerAttendance = async (req, res) => {
  try {
    const { _id } = req.params;
    const { date, status } = req.body;

    if (!date || !status) {
      return res
        .status(400)
        .json({ status: "fail", message: "Date and status are required" });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const manager = await User.findOne({
      _id,
      role: "manager",
    }).select("firstName lastName organizationAdminId attendance");

    if (!manager) {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    if (manager.organizationAdminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    const existingRecord = manager.attendance.find(
      (record) =>
        new Date(record.date).toISOString().split("T")[0] ===
        normalizedDate.toISOString().split("T")[0]
    );

    if (existingRecord) {
      existingRecord.status = status;
    } else {
      manager.attendance.push({ date: normalizedDate, status });
    }

    const updatedManager = await manager.save();

    return res.status(200).json({
      status: "success",
      message: "Attendance updated successfully",
      manager: `${updatedManager.firstName} ${updatedManager.lastName}`,
      attendance: updatedManager.attendance,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const checkTodayManagerAttendance = async (req, res) => {
  try {
    const managerId = req.user._id;
    const todayStr = new Date().toISOString().split("T")[0];

    const manager = await User.findById(managerId).select("attendance role");
    if (!manager || manager.role !== "manager") {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    const alreadyMarked = manager.attendance.some(
      (record) => record.date.toISOString().split("T")[0] === todayStr
    );

    return res.status(200).json({
      status: "success",
      marked: alreadyMarked,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

export const getOrgAdminManagerSalesReport = async (req, res) => {
  try {
    const orgAdminId = req.user._id;
    const { startDate, endDate, range = "monthly" } = req.query;

    if (!startDate || !endDate) {
      return res.status(200).json({
        status: "success",
        data: {
          managers: [],
          summary: {
            totalRevenue: 0,
            totalOrders: 0,
            totalDiscount: 0,
            totalTax: 0,
          },
        },
        message: "Please select a start and end date to view the report.",
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const managers = await User.find({
      role: "manager",
      organizationAdminId: orgAdminId,
    }).select("_id firstName lastName");

    const managerIds = managers.map((m) => m._id);
    if (!managerIds.length) {
      return res.status(200).json({
        status: "success",
        data: {
          managers: [],
          summary: {
            totalRevenue: 0,
            totalOrders: 0,
            totalDiscount: 0,
            totalTax: 0,
          },
        },
      });
    }

    let groupId = {};
    switch (range) {
      case "daily":
        groupId = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "weekly":
        groupId = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "monthly":
        groupId = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      case "quarterly":
        groupId = {
          year: { $year: "$createdAt" },
          quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
        };
        break;
      case "yearly":
        groupId = {
          year: { $year: "$createdAt" },
        };
        break;
      default:
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid range selected." });
    }

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $match: {
          status: "Completed",
          createdAt: { $gte: start, $lte: end },
          "employee.managerId": { $in: managerIds },
        },
      },
      {
        $addFields: {
          totalItemDiscount: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $multiply: [
                    "$$item.price",
                    "$$item.quantity",
                    { $divide: ["$$item.discount", 100] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            ...groupId,
            managerId: "$employee.managerId",
          },
          totalRevenue: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: "$totalItemDiscount" },
          totalTax: { $sum: "$taxAmount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.managerId",
          foreignField: "_id",
          as: "managerDetails",
        },
      },
      {
        $unwind: {
          path: "$managerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: 1,
          totalDiscount: { $round: ["$totalDiscount", 2] },
          totalTax: { $round: ["$totalTax", 2] },
          managerName: {
            $concat: [
              "$managerDetails.firstName",
              " ",
              "$managerDetails.lastName",
            ],
          },
        },
      },
      {
        $addFields: {
          sortDate: {
            $dateFromParts: {
              year: "$_id.year",
              month: { $ifNull: ["$_id.month", 1] },
              day: { $ifNull: ["$_id.day", 1] },
            },
          },
        },
      },
      { $sort: { sortDate: 1 } },
    ]);

    const summary = orders.reduce(
      (acc, curr) => {
        acc.totalRevenue += curr.totalRevenue;
        acc.totalOrders += curr.totalOrders;
        acc.totalDiscount += curr.totalDiscount;
        acc.totalTax += curr.totalTax;
        return acc;
      },
      { totalRevenue: 0, totalOrders: 0, totalDiscount: 0, totalTax: 0 }
    );

    res.status(200).json({
      status: "success",
      filterRange: { start, end },
      groupType: range,
      data: orders,
      summary,
    });
  } catch (err) {
    console.error("❌ Error fetching org admin manager sales report:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};
