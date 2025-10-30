import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const ManagerSalesReport = () => {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalDiscount: 0,
    totalTax: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: "", type: "" });
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });

  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3000);
  };

  const fetchSalesReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/manager/sales-report", { params: filters });
      setEmployees(res.data.data.employees || []);
      setSummary(
        res.data.data.summary || {
          totalRevenue: 0,
          totalOrders: 0,
          totalDiscount: 0,
          totalTax: 0,
        }
      );
    } catch (err) {
      triggerNotification("Failed to fetch sales report.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSalesReport();
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center vh-100 align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {notification.msg && (
        <div
          className={`alert alert-${notification.type} shadow-sm position-fixed end-0 mt-5 me-3`}
          role="alert"
          style={{ zIndex: 1055, minWidth: "280px" }}
        >
          {notification.msg}
        </div>
      )}

      <div className="mb-4 border-bottom p-3 d-flex flex-wrap align-items-center justify-content-between">
        <h3 className="fw-bold mb-3">Manager Sales Report</h3>
        <form className="d-flex gap-2 flex-wrap" onSubmit={handleFilterSubmit} style={{ minWidth: "120px" }}>
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
          <button className="btn btn-primary">Filter</button>
        </form>
      </div>

      <div className="row mb-4">
        {[
          {
            title: "Total Revenue",
            value: summary.totalRevenue,
            className: "bg-success",
          },
          {
            title: "Total Orders",
            value: summary.totalOrders,
            className: "bg-primary",
          },
          {
            title: "Total Discount",
            value: summary.totalDiscount,
            className: "bg-warning",
          },
          { title: "Total Tax", value: summary.totalTax, className: "bg-info" },
        ].map((item) => (
          <div className="col-md-3 mb-3" key={item.title}>
            <div className={`card text-white ${item.className} shadow-sm`}>
              <div className="card-body">
                <h6 className="card-title">{item.title}</h6>
                <h4 className="card-text">{item.value.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Employee Name</th>
                  <th>Total Revenue</th>
                  <th>Total Orders</th>
                  <th>Total Discount</th>
                  <th>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {employees.length ? (
                  employees.map((emp) => (
                    <tr key={emp.employeeId}>
                      <td>{emp.employeeName}</td>
                      <td>{emp.totalRevenue.toFixed(2)}</td>
                      <td>{emp.totalOrders}</td>
                      <td>{emp.totalDiscount.toFixed(2)}</td>
                      <td>{emp.totalTax.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No employee sales data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSalesReport;
