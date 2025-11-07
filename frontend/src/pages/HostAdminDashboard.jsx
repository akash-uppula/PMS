import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const DASHBOARD_SECTIONS = [
  {
    title: "Manage Organization Admins",
    description: "Create, update, and monitor organization admins",
    emoji: "🏢",
    path: "/host-admin/organization-admins",
  },
  {
    title: "System Revenue",
    description: "View total revenue across all organizations",
    emoji: "💰",
    path: "/host-admin/revenue",
  },
  {
    title: "Platform Reports",
    description: "Analytics and performance of the entire platform",
    emoji: "📈",
    path: "/host-admin/reports",
  },
  {
    title: "Settings",
    description: "Platform-wide settings and configurations",
    emoji: "⚙️",
    path: "/host-admin/settings",
  },
  {
    title: "Logout",
    description: "End your session securely",
    emoji: "🚪",
    action: "logout",
  },
];

const HostAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleSectionClick = (section) => {
    if (section.action === "logout") {
      logout();
      navigate("/login");
    } else if (section.path) {
      navigate(section.path);
    }
  };

  return (
    <div className="dashboard-wrapper min-vh-100">
      <header className="dashboard-header text-center py-4">
        <h2 className="fw-bold mb-1">Host Administrator Dashboard</h2>
        <p className="text-muted mb-0">
          Manage your platform efficiently and with ease ✨
        </p>
      </header>

      <main className="container py-5">
        <div className="row g-4 justify-content-center">
          {DASHBOARD_SECTIONS.map((section, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4">
              <div
                role="button"
                tabIndex={0}
                className="card-custom p-4"
                onClick={() => handleSectionClick(section)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSectionClick(section);
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

export default HostAdminDashboard;
