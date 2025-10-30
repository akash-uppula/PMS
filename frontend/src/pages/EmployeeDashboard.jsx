import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosInstance";
import "./Dashboard.css";

const EmployeeDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const res = await api.get("/employee/attendance/today");
        if (res.data.marked) setAttendanceMarked(true);
      } catch (err) {
        console.error(err);
      }
    };
    checkAttendance();
  }, []);

  const markAttendance = async () => {
    if (attendanceMarked) {
      setMessage("⚠️ Attendance already marked for today!");
      return;
    }
    try {
      const res = await api.post("/employee/attendance/mark");
      if (res.data.status === "success") {
        setAttendanceMarked(true);
        setMessage("✅ Attendance marked successfully!");
      }
    } catch (err) {
      setMessage("❌ Failed to mark attendance. Try again.");
    }
  };

  const sections = [
    {
      title: "Mark Attendance",
      description: attendanceMarked
        ? "You have already marked attendance today."
        : "Mark your attendance for today",
      emoji: "📝",
      action: markAttendance,
    },
    {
      title: "View Products",
      description: "See products added by your Organization Admin",
      emoji: "📦",
      path: "/employee/products",
    },
    {
      title: "Generate Quotations",
      description: "Create quotations for customer requests",
      emoji: "🧾",
      path: "/employee/createQuotation",
    },
    {
      title: "View My Quotations",
      description: "Check all quotations you have created",
      emoji: "📄",
      path: "/employee/quotations/ViewDraftQuotations",
    },
    {
      title: "Finalize Quotation",
      description: "Select and finalize a draft quotation",
      emoji: "✅",
      path: "/employee/quotations/finalize",
    },
    {
      title: "View Finalized Quotations",
      description: "Check all quotations that have been finalized",
      emoji: "📑",
      path: "/employee/quotations/finalized",
    },
    {
      title: "View My Orders",
      description: "Check all orders you have created",
      emoji: "🛒",
      path: "/employee/orders/ViewOrders",
    },
    {
      title: "Logout",
      description: "End your session securely",
      emoji: "🚪",
      action: logout,
    },
  ];

  const handleSectionClick = (section) => {
    if (section.action) {
      section.action();
      if (section.title === "Logout") navigate("/login");
    } else if (section.path) {
      navigate(section.path);
    }
  };

  return (
    <div className="dashboard-wrapper min-vh-100">
      <header className="dashboard-header text-center py-4">
        <h2 className="fw-bold mb-1">Employee Dashboard</h2>
        <p className="text-muted mb-0">
          Handle customers, quotations, and products efficiently ✨
        </p>
      </header>

      <main className="container py-5">
        {message && (
          <div className="alert alert-warning text-center">{message}</div>
        )}

        <div className="row g-4 justify-content-center">
          {sections.map((section, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4">
              <div
                role="button"
                tabIndex={0}
                className="card-custom p-4"
                onClick={() => handleSectionClick(section)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleSectionClick(section);
                }}
              >
                <div className="emoji-circle mb-3">{section.emoji}</div>
                <h5 className="fw-semibold mb-2">{section.title}</h5>
                <p className="text-muted small">{section.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
