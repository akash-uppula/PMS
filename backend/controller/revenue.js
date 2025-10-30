import mongoose from "mongoose";
import Order from "../model/order.js";
import User from "../model/user.js";

export const getSystemWideRevenue = async (req, res) => {
  try {
    const { startDate, endDate, range = "monthly" } = req.query;

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
      start.setMonth(end.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
    }

    const matchStage = {
      $match: {
        status: "Completed",
        createdAt: { $gte: start, $lte: end },
      },
    };

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
          week: { $isoWeek: "$createdAt" },
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
        groupId = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
    }

    const orgWiseRevenue = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: "$organizationAdminId",
          totalRevenue: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "organizationAdmin",
        },
      },
      { $unwind: "$organizationAdmin" },
      {
        $project: {
          _id: 0,
          organizationAdminId: "$organizationAdmin._id",
          organizationName: {
            $concat: [
              "$organizationAdmin.firstName",
              " ",
              "$organizationAdmin.lastName",
            ],
          },
          email: "$organizationAdmin.email",
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const trendData = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: "$grandTotal" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    const totalSystemRevenue = orgWiseRevenue.reduce(
      (acc, o) => acc + o.totalRevenue,
      0
    );
    const totalOrders = orgWiseRevenue.reduce(
      (acc, o) => acc + o.totalOrders,
      0
    );

    res.status(200).json({
      status: "success",
      filterRange: { start, end },
      groupType: range,
      summary: { totalSystemRevenue, totalOrders },
      organizationWise: orgWiseRevenue,
      trendOverTime: trendData,
    });
  } catch (err) {
    console.error("❌ Error fetching Host Admin revenue data:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch revenue visualization data",
      error: err.message,
    });
  }
};
