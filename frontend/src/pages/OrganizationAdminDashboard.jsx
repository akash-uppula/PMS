import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const sections = [
  {
    id: "managers",
    title: "Manage Managers",
    description: "Add, update, and track managers",
    emoji: "👨‍💼",
    path: "/organization-admin/managers",
  },
      {
      title: "Salary Reports",
      description: "Calculate and view salaries based on attendance",
      emoji: "💰",
      path: "/organization-admin/salary",
    },
  {
    id: "products",
    title: "Products",
    description: "Create and manage products",
    emoji: "📦",
    path: "/organization-admin/products",
  },
  {
    id: "categories",
    title: "Categories",
    description: "Organize items into categories",
    emoji: "🗂️",
    path: "/organization-admin/categories",
  },
  {
    id: "reports",
    title: "Financial Reports",
    description: "View revenue & analytics",
    emoji: "📊",
    path: "/organization-admin/reports",
  },
  {
    id: "manager-sales-report",
    title: "Manager Sales Report",
    description: "View sales performance of all managers",
    emoji: "📈",
    path: "/organization-admin/manager/sales-report",
  },
  {
    id: "orgadmin-pl-report",
    title: "Profit & Loss Report",
    description: "View P&L reports",
    emoji: "💰",
    path: "/organization-admin/pl-report",
  },
  {
    id: "logout",
    title: "Logout",
    description: "End your session securely",
    emoji: "🚪",
    action: "logout",
  },
];

const OrganizationAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleClick = (section) => {
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
        <h2 className="fw-bold mb-1">Organization Admin Dashboard</h2>
        <p className="text-muted mb-0">
          Manage your organization efficiently ✨
        </p>
      </header>

      <main className="container py-5">
        <div className="row g-4 justify-content-center">
          {sections.map((section) => (
            <div key={section.id} className="col-12 col-sm-6 col-lg-4">
              <div
                role="button"
                tabIndex={0}
                className="card-custom p-4"
                onClick={() => handleClick(section)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleClick(section);
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

export default OrganizationAdminDashboard;
