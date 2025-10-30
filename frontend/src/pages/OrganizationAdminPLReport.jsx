import React, { useState } from "react";
import api from "../api/axiosInstance";
import { FaDollarSign, FaMoneyBillWave, FaBalanceScale, FaPercentage } from "react-icons/fa";

const OrganizationAdminPLReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    loss: 0,
    totalGST: 0,
    nonGSTRevenue: 0,
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

  const fetchPLReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      triggerNotification("Please select start and end dates.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get("/organization-admin/reports/pl-report", { params: filters });
      setReportData(res.data.data || []);
      setSummary(res.data.summary || {
        totalRevenue: 0,
        totalCost: 0,
        profit: 0,
        loss: 0,
        totalGST: 0,
        nonGSTRevenue: 0,
      });
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to fetch P&L report.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPLReport();
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
        <h3 className="fw-bold mb-0">Organization Admin P&L Report</h3>
        <form className="d-flex gap-2 flex-wrap" onSubmit={handleFilterSubmit} style={{ minWidth: "300px" }}>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: "120px" }}
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: "120px" }}
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <select
            className="form-select form-select-sm"
            style={{ width: "120px" }}
            value={filters.range}
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
        <div className="d-flex justify-content-center vh-100 align-items-center">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-6 g-3 mb-4">
            {[
              { title: "Total Revenue (₹)", value: summary.totalRevenue, icon: <FaDollarSign size={24} />, bg: "bg-success" },
              { title: "Total Cost (₹)", value: summary.totalCost, icon: <FaMoneyBillWave size={24} />, bg: "bg-primary" },
              { title: "Profit (₹)", value: summary.profit, icon: <FaBalanceScale size={24} />, bg: "bg-success" },
              { title: "Loss (₹)", value: summary.loss, icon: <FaBalanceScale size={24} />, bg: "bg-danger" },
              { title: "GST (₹)", value: summary.totalGST, icon: <FaPercentage size={24} />, bg: "bg-info" },
              { title: "Non-GST Revenue (₹)", value: summary.nonGSTRevenue, icon: <FaDollarSign size={24} />, bg: "bg-warning" },
            ].map((item) => (
              <div className="col" key={item.title}>
                <div className={`card text-white ${item.bg} shadow-sm rounded-4 h-100`}>
                  <div className="card-body d-flex align-items-center gap-3">
                    <div>{item.icon}</div>
                    <div>
                      <h6 className="card-title mb-1">{item.title}</h6>
                      <h5 className="card-text mb-0">{typeof item.value === "number" ? item.value.toFixed(2) : item.value}</h5>
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
                      <th>Period</th>
                      <th>Revenue (₹)</th>
                      <th>Cost (₹)</th>
                      <th>Profit (₹)</th>
                      <th>Loss (₹)</th>
                      <th>GST (₹)</th>
                      <th>Non-GST Revenue (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length ? (
                      reportData.map((item, i) => {
                        let timeLabel = "";
                        if (item._id.day) timeLabel = `${item._id.year}-${item._id.month}-${item._id.day}`;
                        else if (item._id.month) timeLabel = `${item._id.year}-${item._id.month}`;
                        else if (item._id.quarter) timeLabel = `Q${item._id.quarter} ${item._id.year}`;
                        else if (item._id.year) timeLabel = `${item._id.year}`;

                        return (
                          <tr key={i} className="align-middle">
                            <td>{timeLabel}</td>
                            <td>{item.totalRevenue.toFixed(2)}</td>
                            <td>{item.totalCost.toFixed(2)}</td>
                            <td className="text-success">{item.profit.toFixed(2)}</td>
                            <td className="text-danger">{item.loss.toFixed(2)}</td>
                            <td>{item.totalGST.toFixed(2)}</td>
                            <td>{item.nonGSTRevenue.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No P&L data found for the selected range.
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

export default OrganizationAdminPLReport;
