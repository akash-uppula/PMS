import Order from "../model/order.js";
import mongoose from "mongoose";

export const getSalesReport = async (req, res) => {
  try {
    const { range = "monthly", startDate, endDate } = req.query;

    if (req.user.role !== "organization-admin") {
      return res.status(403).json({
        message: "Access denied. Only organization admins can view reports.",
      });
    }

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
        organizationAdminId: new mongoose.Types.ObjectId(req.user._id),
        status: { $in: ["Completed", "Active"] },
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
        return res.status(400).json({ message: "Invalid range filter." });
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
          itemDiscount: {
            $multiply: [
              "$items.price",
              "$items.quantity",
              { $divide: ["$items.discount", 100] },
            ],
          },
          itemTotalBeforeDiscount: {
            $multiply: ["$items.price", "$items.quantity"],
          },
        },
      },

      {
        $group: {
          _id: {
            product: "$items.product",
            ...groupId,
          },
          productName: { $first: "$productDetails.name" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$grandTotal" },
          totalDiscount: { $sum: "$itemDiscount" },
          totalTax: { $sum: "$taxAmount" },
          orderCount: { $sum: 1 },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({
      organizationAdminId: req.user._id,
      status: { $in: ["Completed", "Active"] },
      createdAt: { $gte: start, $lte: end },
    });

    const totalRevenue = report.reduce((sum, r) => sum + r.totalRevenue, 0);

    res.status(200).json({
      status: "success",
      filterRange: { start, end },
      groupType: range,
      summary: {
        totalProductsSold: report.length,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
      },
      data: report,
    });
  } catch (err) {
    console.error("❌ Error generating sales report:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};
