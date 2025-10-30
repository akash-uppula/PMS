import Order from "../model/order.js";
import mongoose from "mongoose";

export const getOrgAdminPLReport = async (req, res) => {
  try {
    const orgAdminId = req.user._id;
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
      start.setDate(end.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    const matchStage = {
      $match: {
        organizationAdminId: new mongoose.Types.ObjectId(orgAdminId),
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
        return res.status(400).json({ message: "Invalid range filter" });
    }

    const report = await Order.aggregate([
      matchStage,
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },

      {
        $addFields: {
          actualCP: {
            $multiply: [
              "$items.quantity",
              {
                $subtract: [
                  "$productDetails.price",
                  {
                    $multiply: [
                      "$productDetails.price",
                      { $divide: ["$productDetails.maxDiscount", 100] },
                    ],
                  },
                ],
              },
            ],
          },
          actualSP: {
            $multiply: [
              "$items.quantity",
              {
                $subtract: [
                  "$items.price",
                  {
                    $multiply: [
                      "$items.price",
                      { $divide: ["$items.discount", 100] },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },

      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: "$grandTotal" },
          totalCost: { $sum: "$actualCP" },
          totalSP: { $sum: "$actualSP" },
          totalTax: { $sum: { $ifNull: ["$taxAmount", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const formattedReport = report.map((r) => {
      const profit = r.totalSP - r.totalCost;
      const loss = r.totalCost > r.totalSP ? r.totalCost - r.totalSP : 0;

      return {
        _id: r._id,
        totalRevenue: r.totalRevenue,
        totalCost: r.totalCost,
        profit,
        loss,
        totalGST: r.totalTax,
        nonGSTRevenue: r.totalRevenue - r.totalTax,
      };
    });

    const summary = formattedReport.reduce(
      (acc, curr) => {
        acc.totalRevenue += curr.totalRevenue;
        acc.totalCost += curr.totalCost;
        acc.profit += curr.profit;
        acc.loss += curr.loss;
        acc.totalGST += curr.totalGST;
        acc.nonGSTRevenue += curr.nonGSTRevenue;
        return acc;
      },
      { totalRevenue: 0, totalCost: 0, profit: 0, loss: 0, totalGST: 0, nonGSTRevenue: 0 }
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayData = await Order.aggregate([
      {
        $match: {
          organizationAdminId: new mongoose.Types.ObjectId(orgAdminId),
          status: "Completed",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $addFields: {
          actualCP: {
            $multiply: [
              "$items.quantity",
              {
                $subtract: [
                  "$productDetails.price",
                  {
                    $multiply: [
                      "$productDetails.price",
                      { $divide: ["$productDetails.maxDiscount", 100] },
                    ],
                  },
                ],
              },
            ],
          },
          actualSP: {
            $multiply: [
              "$items.quantity",
              {
                $subtract: [
                  "$items.price",
                  {
                    $multiply: [
                      "$items.price",
                      { $divide: ["$items.discount", 100] },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          totalCost: { $sum: "$actualCP" },
          totalSP: { $sum: "$actualSP" },
          totalTax: { $sum: { $ifNull: ["$taxAmount", 0] } },
        },
      },
    ]);

    const todaySummary = todayData.length
      ? {
          totalRevenue: todayData[0].totalRevenue,
          totalCost: todayData[0].totalCost,
          profit: todayData[0].totalSP - todayData[0].totalCost,
          loss:
            todayData[0].totalCost > todayData[0].totalSP
              ? todayData[0].totalCost - todayData[0].totalSP
              : 0,
          totalGST: todayData[0].totalTax,
          nonGSTRevenue: todayData[0].totalRevenue - todayData[0].totalTax,
        }
      : {
          totalRevenue: 0,
          totalCost: 0,
          profit: 0,
          loss: 0,
          totalGST: 0,
          nonGSTRevenue: 0,
        };

    res.status(200).json({
      status: "success",
      filterRange: { start, end },
      groupType: range,
      summary,
      today: todaySummary,
      data: formattedReport,
    });
  } catch (err) {
    console.error("❌ Error generating P&L report:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};
