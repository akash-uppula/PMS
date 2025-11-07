import React, { useState } from "react";
import api from "../api/axiosInstance";
import { FaUsers, FaDollarSign, FaReceipt, FaPercent } from "react-icons/fa";

const OrganizationAdminManagerSales = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalDiscount: 0,
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

  const fetchManagerReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      triggerNotification("Please select start and end dates.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get("/organization-admin/manager/sales-report", {
        params: filters,
      });

      setReportData(res.data.data || []);
      setSummary(res.data.summary || {
        totalRevenue: 0,
        totalOrders: 0,
        totalDiscount: 0,
        totalTax: 0,
      });
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to fetch manager sales report.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchManagerReport();
  };

  const formatTimePeriod = (item) => {
    const id = item._id || {};
    if (id.day)
      return `${id.year}-${id.month.toString().padStart(2, "0")}-${id.day
        .toString()
        .padStart(2, "0")}`;
    if (id.week) return `Week ${id.week}, ${id.year}`;
    if (id.month)
      return `${id.year}-${id.month.toString().padStart(2, "0")}`;
    if (id.quarter) return `Q${id.quarter} ${id.year}`;
    if (id.year) return `${id.year}`;
    return "-";
  };

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
        <h3 className="fw-bold mb-0">Manager Sales Report</h3>
        <form
          className="d-flex gap-2 flex-wrap"
          onSubmit={handleFilterSubmit}
          style={{ minWidth: "300px" }}
        >
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: "120px" }}
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: "120px" }}
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
          <select
            className="form-select form-select-sm"
            style={{ width: "120px" }}
            value={filters.range}
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
        <div className="d-flex justify-content-center vh-100 align-items-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            {[
              {
                title: "Total Revenue (₹)",
                value: summary.totalRevenue,
                icon: <FaDollarSign size={24} />,
                bg: "bg-success",
              },
              {
                title: "Total Orders",
                value: summary.totalOrders,
                icon: <FaReceipt size={24} />,
                bg: "bg-primary",
              },
              {
                title: "Total Discount (₹)",
                value: summary.totalDiscount,
                icon: <FaPercent size={24} />,
                bg: "bg-warning",
              },
              {
                title: "Total Tax (₹)",
                value: summary.totalTax,
                icon: <FaUsers size={24} />,
                bg: "bg-info",
              },
            ].map((item) => (
              <div className="col-md-3 mb-3" key={item.title}>
                <div
                  className={`card text-white ${item.bg} shadow-sm rounded-4`}
                >
                  <div className="card-body d-flex align-items-center gap-3">
                    <div>{item.icon}</div>
                    <div>
                      <h6 className="card-title mb-1">{item.title}</h6>
                      <h4 className="card-text mb-0">
                        {typeof item.value === "number"
                          ? item.value.toFixed(2)
                          : item.value}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Time Period</th>
                      <th>Manager Name</th>
                      <th>Total Revenue (₹)</th>
                      <th>Total Orders</th>
                      <th>Total Discount (₹)</th>
                      <th>Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length ? (
                      reportData.map((item, i) => (
                        <tr key={i}>
                          <td>{formatTimePeriod(item)}</td>
                          <td>{item.managerName || "N/A"}</td>
                          <td>{item.totalRevenue.toFixed(2)}</td>
                          <td>{item.totalOrders}</td>
                          <td>{item.totalDiscount.toFixed(2)}</td>
                          <td>{item.totalTax.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No manager sales data found for the selected range.
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

export default OrganizationAdminManagerSales;
