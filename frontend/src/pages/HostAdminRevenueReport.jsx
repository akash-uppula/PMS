import React, { useState } from "react";
import api from "../api/axiosInstance";
import {
  FaBuilding,
  FaChartLine,
  FaMoneyBillWave,
  FaFileInvoice,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const HostAdminRevenueReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalOrganizations: 0,
    totalTax: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ msg: "", type: "" });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    range: "monthly",
  });

  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3000);
  };

  const safeNumber = (num) =>
    typeof num === "number" ? num.toFixed(2) : "0.00";

  const fetchRevenueReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      triggerNotification("Please select start and end dates.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get("/host-admin/reports/revenue", {
        params: filters,
      });
      const result = res.data;

      if (result.status !== "success") {
        throw new Error("Failed to fetch data");
      }

      const report = result.data || [];
      const summary = result.summary || {};

      setReportData(report);
      setSummary(summary);
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to fetch revenue data.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRevenueReport();
  };

  // ✅ Step 1: Prepare chart data
  const trendChartData = reportData.map((item) => {
    let period;
    switch (filters.range) {
      case "daily":
        period = `${item._id.year}-${item._id.month
          ?.toString()
          .padStart(2, "0")}-${item._id.day}`;
        break;
      case "weekly":
        period = `Week ${item._id.week}, ${item._id.year}`;
        break;
      case "quarterly":
        period = `Q${item._id.quarter} ${item._id.year}`;
        break;
      case "yearly":
        period = `${item._id.year}`;
        break;
      default:
        period = `${item._id.year}-${item._id.month
          ?.toString()
          .padStart(2, "0")}`;
    }
    return {
      period,
      revenue: item.totalRevenue,
      tax: item.totalTax,
    };
  });

  // ✅ Step 2: Aggregate by period (fix overlapping bars)
  const aggregatedTrendData = Object.values(
    trendChartData.reduce((acc, curr) => {
      if (!acc[curr.period]) {
        acc[curr.period] = { ...curr };
      } else {
        acc[curr.period].revenue += curr.revenue;
        acc[curr.period].tax += curr.tax;
      }
      return acc;
    }, {})
  );

  // ✅ Step 3: Sort by chronological order (optional improvement)
  aggregatedTrendData.sort((a, b) => a.period.localeCompare(b.period));

  return (
    <div className="container-fluid py-4">
      {notification.msg && (
        <div
          className={`alert alert-${notification.type} shadow-lg position-fixed end-0 mt-5 me-3`}
          style={{ zIndex: 1055, minWidth: "280px", borderRadius: "10px" }}
        >
          {notification.msg}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center py-3 flex-wrap">
        <h3 className="fw-bold mb-0">System-wide Revenue Overview</h3>
        <form
          className="d-flex gap-2 flex-wrap"
          onSubmit={handleFilterSubmit}
          style={{ minWidth: "120px" }}
        >
          <input
            type="date"
            className="form-control form-control-sm"
            value={filters.startDate}
            style={{ width: "120px" }}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <input
            type="date"
            className="form-control form-control-sm"
            value={filters.endDate}
            style={{ width: "120px" }}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
          <select
            className="form-select form-select-sm"
            value={filters.range}
            style={{ width: "120px" }}
            onChange={(e) => setFilters({ ...filters, range: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="btn btn-primary btn-sm">Apply</button>
        </form>
      </div>

      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "60vh" }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      ) : (
        <>
          {/* ✅ Summary Cards */}
          <div className="row mb-4">
            {[
              {
                title: "Total Revenue (₹)",
                value: safeNumber(summary.totalRevenue),
                icon: <FaMoneyBillWave size={22} />,
                bg: "bg-success",
              },
              {
                title: "Total Orders",
                value: summary.totalOrders || 0,
                icon: <FaFileInvoice size={22} />,
                bg: "bg-primary",
              },
              {
                title: "Total Organizations",
                value: summary.totalOrganizations || 0,
                icon: <FaBuilding size={22} />,
                bg: "bg-info",
              },
              {
                title: "Total Tax (₹)",
                value: safeNumber(summary.totalTax),
                icon: <FaChartLine size={22} />,
                bg: "bg-warning",
              },
            ].map((card) => (
              <div className="col-md-3 mb-3" key={card.title}>
                <div
                  className={`card text-white ${card.bg} shadow-sm rounded-4`}
                >
                  <div className="card-body d-flex align-items-center gap-3">
                    {card.icon}
                    <div>
                      <h6 className="mb-1">{card.title}</h6>
                      <h4 className="mb-0">{card.value}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Chart Section */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Revenue Trend Over Time</h5>
              {aggregatedTrendData.length ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aggregatedTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `₹${safeNumber(value)}`,
                        name === "revenue" ? "Revenue" : "Tax",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0d6efd" name="Revenue (₹)" />
                    <Bar dataKey="tax" fill="#ffc107" name="Tax (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted py-4">
                  No trend data available.
                </p>
              )}
            </div>
          </div>

          {/* ✅ Table Section */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Organization Admin</th>
                      <th>Period</th>
                      <th>Total Revenue (₹)</th>
                      <th>Total Orders</th>
                      <th>Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length ? (
                      reportData.map((item, i) => (
                        <tr key={i}>
                          <td>{item.organizationAdmin || "N/A"}</td>
                          <td>
                            {filters.range === "daily"
                              ? `${item._id.year}-${item._id.month
                                  ?.toString()
                                  .padStart(2, "0")}-${item._id.day}`
                              : filters.range === "weekly"
                              ? `Week ${item._id.week}, ${item._id.year}`
                              : filters.range === "quarterly"
                              ? `Q${item._id.quarter} ${item._id.year}`
                              : `${item._id.year}`}
                          </td>
                          <td>{safeNumber(item.totalRevenue)}</td>
                          <td>{item.totalOrders}</td>
                          <td>{safeNumber(item.totalTax)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HostAdminRevenueReport;
