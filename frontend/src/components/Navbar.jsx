import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosInstance";
import "./Navbar.css";

const Navbar = () => {
  const { user, role, logout, loading } = useContext(AuthContext);
  const [hostAdminExists, setHostAdminExists] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkHostAdmin = async () => {
      try {
        const res = await api.get("/host-admin/exists");
        setHostAdminExists(res.data.exists);
      } catch (error) {
        console.error("Failed to check host admin existence:", error);
        setHostAdminExists(true);
      }
    };
    checkHostAdmin();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardLink =
    role === "host-admin"
      ? "/host-admin/dashboard"
      : role === "organization-admin"
      ? "/organization-admin/dashboard"
      : role === "manager"
      ? "/manager/dashboard"
      : role === "employee"
      ? "/employee/dashboard"
      : "/";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container">
        <NavLink className="navbar-brand fw-bold text-primary" to="/">
          PMS
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center fw-semibold">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">
                Home
              </NavLink>
            </li>

            {!loading &&
              (user ? (
                <>
                  <li className="nav-item">
                    <NavLink to={dashboardLink} className="nav-link">
                      Dashboard
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="btn btn-primary btn-sm ms-lg-3"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink to="/login" className="nav-link">
                      Login
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink to="/host-admin/login" className="nav-link">
                      Host Admin
                    </NavLink>
                  </li>
                  
                  {!hostAdminExists && (
                    <li className="nav-item">
                      <NavLink to="/register" className="nav-link">
                        Register
                      </NavLink>
                    </li>
                  )}
                </>
              ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
