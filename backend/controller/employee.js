import User from "../model/user.js";
import Quotation from "../model/quotation.js";
import Order from "../model/order.js";
import bcrypt from "bcryptjs";

export const createEmployee = async (req, res) => {
  const { firstName, lastName, email, password, salary, accessLevel } =
    req.body;

  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !salary ||
      !accessLevel
    ) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const existingEmployee = await User.findOne({ email, role: "employee" });
    if (existingEmployee) {
      return res.status(400).json({
        status: "fail",
        message: "Employee with this email already exists",
      });
    }

    const manager = await User.findById(req.user._id);
    if (!manager) {
      return res
        .status(404)
        .json({ status: "fail", message: "Manager not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "employee",
      status: "Active",
      salary,
      accessLevel,
      managerId: req.user._id,
      organizationAdminId: manager.organizationAdminId,
    });

    const savedEmployee = await newEmployee.save();

    return res.status(201).json({
      status: "success",
      message: "Employee created successfully",
      data: {
        _id: savedEmployee._id,
        firstName: savedEmployee.firstName,
        lastName: savedEmployee.lastName,
        email: savedEmployee.email,
        role: savedEmployee.role,
        status: savedEmployee.status,
        salary: savedEmployee.salary,
        accessLevel: savedEmployee.accessLevel,
        managerId: savedEmployee.managerId,
        organizationAdminId: savedEmployee.organizationAdminId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateEmployee = async (req, res) => {
  const { _id } = req.params;
  const { firstName, lastName, email, password, salary, accessLevel } =
    req.body;

  try {
    const employee = await User.findById(_id);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found",
      });
    }

    if (employee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You can only update your own employees",
      });
    }

    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ email, role: "employee" });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          message: "Email already exists",
        });
      }
      employee.email = email;
    }

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (salary) employee.salary = salary;
    if (accessLevel) employee.accessLevel = accessLevel;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(password, salt);
    }

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      status: "success",
      message: "Employee updated successfully",
      data: {
        _id: updatedEmployee._id,
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        status: updatedEmployee.status,
        salary: updatedEmployee.salary,
        accessLevel: updatedEmployee.accessLevel,
        managerId: updatedEmployee.managerId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  const { _id } = req.params;

  try {
    const employee = await User.findById(_id);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found",
      });
    }

    if (employee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You can only delete your own employees",
      });
    }

    await employee.deleteOne();

    return res.status(200).json({
      status: "success",
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEmployeesByManager = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
      managerId: req.user._id,
    })
      .select("-password")
      .sort({ firstName: 1, lastName: 1});

    return res.status(200).json({
      status: "success",
      message: "Employees fetched successfully",
      results: employees.length,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEmployeesByOrganizationAdmin = async (req, res) => {
  try {
    const { _id } = req.params;

    const employees = await User.find({
      role: "employee",
      managerId: _id,
    })
      .select("-password")
      .sort({ firstName: 1, lastName: 1 });

    return res.status(200).json({
      status: "success",
      message: "Employees fetched successfully (via params)",
      results: employees.length,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const toggleEmployeeStatus = async (req, res) => {
  try {
    const { _id } = req.params;

    const employee = await User.findById(_id);
    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found",
      });
    }

    if (employee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You can only change status of your own employees",
      });
    }

    employee.status = employee.status === "Active" ? "Disabled" : "Active";
    const updatedEmployee = await employee.save();

    return res.status(200).json({
      status: "success",
      message: `Employee status updated to ${updatedEmployee.status}`,
      data: {
        _id: updatedEmployee._id,
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        status: updatedEmployee.status,
        salary: updatedEmployee.salary,
        accessLevel: updatedEmployee.accessLevel,
        managerId: updatedEmployee.managerId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const markEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const employee = await User.findById(employeeId).select("attendance role");
    if (!employee || employee.role !== "employee") {
      return res
        .status(404)
        .json({ status: "fail", message: "Employee not found" });
    }

    const existingRecord = employee.attendance.find(
      (record) => record.date.toISOString().split("T")[0] === todayStr
    );

    if (existingRecord) {
      return res.status(400).json({
        status: "fail",
        message: "Attendance already marked for today",
      });
    }

    employee.attendance.push({ date: today, status: "Present" });
    await employee.save();

    return res.status(200).json({
      status: "success",
      message: "Attendance marked successfully",
      attendance: employee.attendance,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const viewEmployeeAttendanceByManager = async (req, res) => {
  try {
    const { _id } = req.params;

    const employee = await User.findOne({
      _id,
      role: "employee",
    }).select("firstName lastName managerId organizationAdminId attendance");

    if (!employee) {
      return res
        .status(404)
        .json({ status: "fail", message: "Employee not found" });
    }

    if (employee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    return res.status(200).json({
      status: "success",
      message: "Attendance fetched successfully (by manager)",
      employee: `${employee.firstName} ${employee.lastName}`,
      attendance: employee.attendance.sort((a, b) => b.date - a.date),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const viewEmployeeAttendanceByOrganizationAdmin = async (req, res) => {
  try {
    const { _id } = req.params;

    if (req.user.role !== "organization-admin") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Only Organization Admin can view.",
      });
    }

    const employee = await User.findOne({
      _id,
      role: "employee",
    }).select("firstName lastName managerId attendance");

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Attendance fetched successfully (by org admin)",
      employee: `${employee.firstName} ${employee.lastName}`,
      attendance: employee.attendance.sort((a, b) => b.date - a.date),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateEmployeeAttendance = async (req, res) => {
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

    const employee = await User.findOne({
      _id,
      role: "employee",
    }).select("firstName lastName managerId attendance");

    if (!employee) {
      return res
        .status(404)
        .json({ status: "fail", message: "Employee not found" });
    }

    if (employee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    const existingRecord = employee.attendance.find(
      (record) =>
        new Date(record.date).toISOString().split("T")[0] ===
        normalizedDate.toISOString().split("T")[0]
    );

    if (existingRecord) {
      existingRecord.status = status;
    } else {
      employee.attendance.push({ date: normalizedDate, status });
    }

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      status: "success",
      message: "Attendance updated successfully",
      employee: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
      attendance: updatedEmployee.attendance,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const checkTodayEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const todayStr = new Date().toISOString().split("T")[0];

    const employee = await User.findById(employeeId).select("attendance role");
    if (!employee || employee.role !== "employee") {
      return res
        .status(404)
        .json({ status: "fail", message: "Employee not found" });
    }

    const alreadyMarked = employee.attendance.some(
      (record) => record.date.toISOString().split("T")[0] === todayStr
    );

    return res.status(200).json({
      status: "success",
      marked: alreadyMarked,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getFinalizedQuotationsForManager = async (req, res) => {
  try {
    const managerId = req.user._id;

    const employees = await User.find({ managerId, role: "employee" }).select(
      "_id"
    );
    const employeeIds = employees.map((emp) => emp._id);

    const quotations = await Quotation.find({
      createdBy: { $in: employeeIds },
      status: "Finalized",
    })
      .populate("createdBy", "firstName lastName email")
      .populate("items.product", "name price")
      .sort({
        "customer.name": 1,
        createdAt: -1,
      });

    res.status(200).json({ success: true, quotations });
  } catch (error) {
    console.error("Error fetching finalized quotations:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCompletedOrdersForManager = async (req, res) => {
  try {
    const managerId = req.user._id;

    const employees = await User.find({ managerId, role: "employee" }).select(
      "_id"
    );
    const employeeIds = employees.map((emp) => emp._id);

    const orders = await Order.find({
      createdBy: { $in: employeeIds },
      status: "Completed",
    })
      .populate("createdBy", "firstName lastName email")
      .populate("items.product", "name price")
      .sort({
        "customer.name": 1,
        createdAt: -1,
      });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getManagerSalesReport = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { startDate, endDate, range = "monthly" } = req.query;

    if (!startDate || !endDate) {
      return res.status(200).json({
        status: "success",
        data: {
          employees: [],
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

    const employees = await User.find({ managerId, role: "employee" }).select("_id firstName lastName");
    const employeeIds = employees.map((e) => e._id);

    if (!employeeIds.length) {
      return res.status(200).json({
        status: "success",
        data: {
          employees: [],
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
        return res.status(400).json({ status: "fail", message: "Invalid range selected." });
    }

    const orders = await Order.aggregate([
      {
        $match: {
          createdBy: { $in: employeeIds },
          status: "Completed",
          createdAt: { $gte: start, $lte: end },
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
            employeeId: "$createdBy",
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
          localField: "_id.employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
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
          employeeName: {
            $concat: ["$employeeDetails.firstName", " ", "$employeeDetails.lastName"],
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
    console.error("❌ Error fetching manager sales report:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};
