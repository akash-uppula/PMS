import Order from "../model/order.js";
import mongoose from "mongoose";

export const getSystemWideRevenue = async (req, res) => {
  try {
    if (req.user.role !== "host-admin") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Only host admins can view system-wide revenue.",
      });
    }

    const { range = "monthly", startDate, endDate } = req.query;

    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = new Date();
      start.setMonth(end.getMonth() - 1); // default last 30 days
      start.setHours(0, 0, 0, 0);
    }

    // --- Match completed/active orders ---
    const matchStage = {
      $match: {
        status: { $in: ["Completed", "Active"] },
        createdAt: { $gte: start, $lte: end },
      },
    };

    // --- Dynamic grouping ---
    let groupId;
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
        groupId = { year: { $year: "$createdAt" } };
        break;
      default:
        return res.status(400).json({ status: "fail", message: "Invalid range" });
    }

    // --- Aggregation ---
    const report = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            ...groupId,
            organizationAdminId: "$organizationAdminId",
          },
          totalRevenue: { $sum: "$grandTotal" },
          totalTax: { $sum: "$taxAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.organizationAdminId",
          foreignField: "_id",
          as: "organizationAdminDetails",
        },
      },
      {
        $unwind: {
          path: "$organizationAdminDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          totalOrders: 1,
          totalTax: 1,
          organizationAdmin: "$organizationAdminDetails.email",
        },
      },
      // --- ✅ Chronological Sort Fix ---
      {
        $addFields: {
          sortDate: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: { $ifNull: ["$_id.day", 1] },
            },
          },
        },
      },
      { $sort: { sortDate: 1 } },
    ]);

    // --- Global Totals ---
    const overallStats = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 },
          totalTax: { $sum: "$taxAmount" },
          totalOrganizations: { $addToSet: "$organizationAdminId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          totalTax: 1,
          totalOrganizations: { $size: "$totalOrganizations" },
        },
      },
    ]);

    const summary = overallStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalTax: 0,
      totalOrganizations: 0,
    };

    res.status(200).json({
      status: "success",
      filterRange: { start, end },
      groupType: range,
      summary,
      data: report,
    });
  } catch (err) {
    console.error("❌ Error generating system-wide revenue report:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
