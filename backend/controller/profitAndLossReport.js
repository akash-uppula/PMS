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

    // ✅ Dynamic grouping with week and quarter support
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
      // ✅ Chronological sorting using a sortDate field
      {
        $addFields: {
          sortDate: {
            $switch: {
              branches: [
                {
                  case: { $eq: [range, "weekly"] },
                  then: {
                    $dateFromParts: {
                      isoWeekYear: "$_id.year",
                      isoWeek: "$_id.week",
                      isoDayOfWeek: 1,
                    },
                  },
                },
                {
                  case: { $eq: [range, "quarterly"] },
                  then: {
                    $dateFromParts: {
                      year: "$_id.year",
                      month: { $multiply: [{ $subtract: ["$_id.quarter", 1] }, 3] },
                      day: 1,
                    },
                  },
                },
              ],
              default: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: { $ifNull: ["$_id.month", 1] },
                  day: { $ifNull: ["$_id.day", 1] },
                },
              },
            },
          },
        },
      },
      { $sort: { sortDate: 1 } },
    ]);

    const formattedReport = report.map((r) => {
      const profit = r.totalSP - r.totalCost;
      const loss = r.totalCost > r.totalSP ? r.totalCost - r.totalSP : 0;

      let label = "";
      if (range === "weekly" && r._id.week) {
        label = `Week ${r._id.week}, ${r._id.year}`;
      } else if (range === "quarterly" && r._id.quarter) {
        label = `Q${r._id.quarter}, ${r._id.year}`;
      } else if (range === "monthly" && r._id.month) {
        label = `${r._id.month}/${r._id.year}`;
      } else if (range === "daily" && r._id.day) {
        label = `${r._id.day}/${r._id.month}/${r._id.year}`;
      } else {
        label = `${r._id.year}`;
      }

      return {
        label,
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
