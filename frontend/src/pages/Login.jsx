import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, role } = useContext(AuthContext);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    role: "",
    showPassword: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (user && role) {
      setFullPageLoading(true);
      const timer = setTimeout(() => redirectToDashboard(role), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, role]);

  const redirectToDashboard = (role) => {
    const routes = {
      "host-admin": "/host-admin/dashboard",
      "organization-admin": "/organization-admin/dashboard",
      manager: "/manager/dashboard",
      employee: "/employee/dashboard",
    };
    navigate(routes[role] || "/", { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    setFormErrors((prev) => ({ ...prev, [name]: "" }));

    if (formErrors.general) {
      setFormErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const togglePasswordVisibility = () =>
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));

  const validateForm = ({ email, password, role }) => {
    const errors = {};
    if (!email) errors.email = "⚠️ Email is required.";
    if (!password) errors.password = "⚠️ Password is required.";
    else if (password.length < 8)
      errors.password = "⚠️ Password must be at least 8 characters.";
    if (!role) errors.role = "⚠️ Please select a role.";
    return errors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedData = Object.fromEntries(
      Object.entries(formState).map(([key, val]) => [
        key,
        typeof val === "string" ? val.trim() : val,
      ])
    );

    const errors = validateForm(trimmedData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const { email, password, role: selectedRole } = trimmedData;
      const response = await api.post(`/${selectedRole}/login`, {
        email,
        password,
        role: selectedRole,
      });

      const { token, user } = response.data.data;
      login(user, token, selectedRole);

      setFullPageLoading(true);
      setTimeout(() => redirectToDashboard(selectedRole), 1000);
    } catch (err) {
      console.error("Login Error:", err.response?.data);

      let errorMsg = "⚠️ Something went wrong. Please try again.";
      if (err.response) {
        const { status } = err.response;
        if (status === 401) errorMsg = "⚠️ Invalid email or password.";
        else if (status === 403) errorMsg = "⚠️ Not authorized for this role.";
        else if (status === 404) errorMsg = "⚠️ User not found.";
        else if (status === 400) errorMsg = err.response.data?.message || errorMsg;
        else if (status === 500) errorMsg = "⚠️ Server error. Please try again later.";
      }

      setFormErrors({ general: errorMsg });

      setShake(true);
      setTimeout(() => setShake(false), 500);

      setIsSubmitting(false);
      setFullPageLoading(false);
    }
  };

  if (fullPageLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="p-4 text-center shadow-sm bg-white rounded">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="mb-0 fw-semibold text-secondary">
            ⏳ Logging in... Redirecting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className={`p-4 shadow-sm bg-white rounded w-100 ${shake ? "shake" : ""}`}
        style={{ maxWidth: "500px" }}
      >
        <h2 className="text-center text-primary mb-3">Welcome Back 👋</h2>
        <p className="text-center text-muted mb-4">
          Log in to continue with <span className="fw-semibold text-primary">PMS</span>.
        </p>

        {formErrors.general && (
          <div className="alert alert-danger text-center mb-3" role="alert">
            {formErrors.general}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} noValidate>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="form-control"
              autoComplete="email"
            />
            {formErrors.email && (
              <div className="text-danger small mt-1">{formErrors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <div className="position-relative">
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                value={formState.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="form-control pe-5"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                style={{ zIndex: 2 }}
              >
                {formState.showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formErrors.password && (
              <div className="text-danger small mt-1">{formErrors.password}</div>
            )}
          </div>

          <div className="mb-3">
            <select
              name="role"
              value={formState.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="host-admin">Host Administrator</option>
              <option value="organization-admin">
                Organization Administrator
              </option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            {formErrors.role && (
              <div className="text-danger small mt-1">{formErrors.role}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : "Login"}
          </button>
        </form>

        <p className="text-center text-muted mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary text-decoration-none">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
