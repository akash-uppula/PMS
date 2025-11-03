import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ManagerSalary = () => {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salaryData, setSalaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ msg: "", type: "" });

  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/organization-admin/managers");
        setManagers(res.data.data || []);
      } catch {
        triggerNotification("Failed to load managers.", "danger");
      }
    };
    fetchManagers();
  }, []);

  const validateDates = (start, end) => {
    if (start && end) {
      const startObj = new Date(start);
      const endObj = new Date(end);

      if (
        startObj.getMonth() !== endObj.getMonth() ||
        startObj.getFullYear() !== endObj.getFullYear()
      ) {
        triggerNotification(
          "Start and End dates must be within the same month.",
          "warning"
        );
        setEndDate("");
        return false;
      }

      if (startObj > endObj) {
        triggerNotification("End date must be after the start date.", "warning");
        setEndDate("");
        return false;
      }
    }
    return true;
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    if (endDate) validateDates(value, endDate);
  };

  const handleEndDateChange = (value) => {
    if (startDate && !validateDates(startDate, value)) return;
    setEndDate(value);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!selectedManager) {
      triggerNotification("Please select a manager first.", "warning");
      return;
    }
    if (!startDate || !endDate) {
      triggerNotification("Please select both start and end dates.", "warning");
      return;
    }

    setIsLoading(true);
    setSalaryData(null);

    try {
      const res = await api.get(
        `/organization-admin/salary/manager/${selectedManager}`,
        {
          params: { startDate, endDate },
        }
      );
      setSalaryData(res.data.data);
      triggerNotification("Salary calculated successfully!", "success");
    } catch (err) {
      triggerNotification(
        err.response?.data?.message || "Failed to calculate salary.",
        "danger"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!salaryData) return;

    const doc = new jsPDF();
    const title = "Manager Pay Slip";

    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(11);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 30);
    doc.text("Company: PMS", 14, 37);
    doc.text("Email: pms@email.com", 14, 44);
    doc.text("Phone: +91-7013447197", 14, 51);

    autoTable(doc, {
      startY: 65,
      head: [["Field", "Details"]],
      body: [
        ["Manager", salaryData.manager],
        ["Fixed Salary", `$${salaryData.fixedSalary}`],
        ["Total Days", salaryData.totalDays],
        ["Present Days", salaryData.totalPresentDays],
        ["Absent Days", salaryData.absentDays],
        ["Per Day Salary", `$${salaryData.perDaySalary}`],
        ["Final Salary", `$${salaryData.finalSalary}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { halign: "center" },
    });

    doc.text(
      "Thank you for your leadership and hard work!",
      14,
      doc.lastAutoTable.finalY + 10
    );
    doc.save(
      `Manager_Salary_Slip_${salaryData.manager}_${startDate}_to_${endDate}.pdf`
    );
  };

  return (
    <div className="container py-5">
      {notification.msg && (
        <div
          className={`alert alert-${notification.type} shadow-sm position-fixed end-0 mt-5 me-2`}
          role="alert"
          style={{ zIndex: 1055, minWidth: "280px" }}
        >
          {notification.msg}
        </div>
      )}

      <h2 className="fw-bold text-center mb-4" style={{ color: "#000" }}>
        👨‍💼 Calculate Manager Salary by Attendance
      </h2>

      <div
        className="card shadow-sm border-0 mx-auto"
        style={{
          maxWidth: "720px",
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-4">
          <form onSubmit={handleCalculate} className="mb-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">Select Manager</label>
              <select
                className="form-select"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                <option value="">-- Choose Manager --</option>
                {managers.map((mgr) => (
                  <option key={mgr._id} value={mgr._id}>
                    {mgr.firstName} {mgr.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={startDate || ""}
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary px-5 fw-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Salary"}
              </button>
            </div>
          </form>

          {salaryData && (
            <div className="border rounded p-4 bg-light shadow-sm">
              <h5 className="fw-bold text-success mb-3 text-center">
                Salary Details
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Manager:</strong> {salaryData.manager}
                  </p>
                  <p>
                    <strong>Fixed Salary:</strong> ${salaryData.fixedSalary}
                  </p>
                  <p>
                    <strong>Total Days:</strong> {salaryData.totalDays}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Present Days:</strong> {salaryData.totalPresentDays}
                  </p>
                  <p>
                    <strong>Absent Days:</strong> {salaryData.absentDays}
                  </p>
                  <p>
                    <strong>Per Day Salary:</strong> ${salaryData.perDaySalary}
                  </p>
                </div>
              </div>
              <div className="border-top pt-3 text-center">
                <h5 className="text-primary fw-bold">
                  Final Salary: ${salaryData.finalSalary}
                </h5>
              </div>

              <div className="text-center mt-4">
                <button
                  className="btn btn-outline-success fw-semibold"
                  onClick={handleDownloadPDF}
                >
                  📄 Download Salary Slip (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSalary;
