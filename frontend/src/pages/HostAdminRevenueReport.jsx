import React, { useState } from "react";
import api from "../api/axiosInstance";
import { FaBuilding, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
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
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrganizations: 0,
    topOrganization: "",
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

  const safeNumber = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

  const fetchRevenueReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      triggerNotification("Please select start and end dates.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get("/host-admin/reports/revenue", { params: filters });

      const orgData = res.data.organizationWise || [];
      const trend = res.data.trendOverTime || [];
      setReportData(orgData);
      setTrendData(trend);

      const summaryData = res.data.summary || {};
      setSummary({
        totalRevenue: summaryData.totalSystemRevenue || 0,
        totalOrganizations: orgData.length,
        topOrganization: orgData.length ? orgData[0].organizationName : "N/A",
      });
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

  const trendChartData = trendData.map((item) => ({
    period: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
    revenue: item.totalRevenue,
  }));

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
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <input
            type="date"
            className="form-control form-control-sm"
            value={filters.endDate}
            style={{ width: "120px" }}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <select
            className="form-select form-select-sm"
            value={filters.range}
            style={{ width: "120px" }}
            onChange={(e) => setFilters({ ...filters, range: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="btn btn-primary btn-sm">Apply</button>
        </form>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            {[
              { title: "Total Revenue (₹)", value: safeNumber(summary.totalRevenue), icon: <FaMoneyBillWave size={22} />, bg: "bg-success" },
              { title: "Total Organizations", value: summary.totalOrganizations || 0, icon: <FaBuilding size={22} />, bg: "bg-primary" },
              { title: "Top Organization", value: summary.topOrganization || "N/A", icon: <FaChartLine size={22} />, bg: "bg-warning" },
            ].map((card) => (
              <div className="col-md-4 mb-3" key={card.title}>
                <div className={`card text-white ${card.bg} shadow-sm rounded-4`}>
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

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Organization-wise Revenue Chart</h5>
              {reportData.length ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="organizationName" />
                    <YAxis />
                    <Tooltip formatter={(value) => safeNumber(value)} />
                    <Legend />
                    <Bar dataKey="totalRevenue" fill="#0d6efd" name="Total Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted py-4">
                  No revenue data found for the selected date range.
                </p>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Revenue Trend Over Time</h5>
              {trendChartData.length ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => safeNumber(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#198754" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted py-4">No trend data available.</p>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Organization</th>
                      <th>Total Revenue (₹)</th>
                      <th>Total Orders</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length ? (
                      reportData.map((org, i) => (
                        <tr key={i}>
                          <td>{org.organizationName || "N/A"}</td>
                          <td>{safeNumber(org.totalRevenue)}</td>
                          <td>{org.totalOrders || 0}</td>
                          <td>{org.email || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
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
