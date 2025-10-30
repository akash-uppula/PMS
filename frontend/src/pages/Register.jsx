import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(false);

  useEffect(() => {
    if (user && role) {
      setFullPageLoading(true);
      const timer = setTimeout(() => {
        const routes = {
          "host-admin": "/host-admin/dashboard",
          "organization-admin": "/organization-admin/dashboard",
        };
        navigate(routes[role] || "/", { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, role, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () =>
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));

  const toggleConfirmPasswordVisibility = () =>
    setFormState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));

  const validateForm = ({ firstName, lastName, email, password, confirmPassword }) => {
    const errors = {};
    if (!firstName) errors.firstName = "⚠️ First name is required.";
    if (!lastName) errors.lastName = "⚠️ Last name is required.";
    if (!email) errors.email = "⚠️ Email is required.";
    if (!password) errors.password = "⚠️ Password is required.";
    else if (password.length < 8) errors.password = "⚠️ Password must be at least 8 characters.";
    if (!confirmPassword) errors.confirmPassword = "⚠️ Confirm password is required.";
    else if (password !== confirmPassword) errors.confirmPassword = "⚠️ Passwords do not match.";
    return errors;
  };

  const handleRegisterSubmit = async (e) => {
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
    setFullPageLoading(true);

    try {
      const { firstName, lastName, email, password } = trimmedData;
      await api.post("/host-admin/register", { firstName, lastName, email, password });
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setFullPageLoading(false);
      setFormErrors({
        general: err.response?.data?.message ?? "⚠️ Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fullPageLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="p-4 text-center shadow-sm bg-white rounded">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="mb-0 fw-semibold">⏳ Creating your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="p-4 shadow-sm bg-white rounded w-100" style={{ maxWidth: "500px" }}>
        <h2 className="text-center text-primary mb-3">Create Account ✨</h2>
        <p className="text-center text-muted mb-4">
          Start your journey with <span className="fw-semibold text-primary">PMS</span>.
        </p>

        {formErrors.general && (
          <div className="alert alert-danger text-center">{formErrors.general}</div>
        )}

        <form onSubmit={handleRegisterSubmit} noValidate>
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                name="firstName"
                value={formState.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className="form-control"
              />
              {formErrors.firstName && <div className="text-danger small mt-1">{formErrors.firstName}</div>}
            </div>
            <div className="col">
              <input
                type="text"
                name="lastName"
                value={formState.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                className="form-control"
              />
              {formErrors.lastName && <div className="text-danger small mt-1">{formErrors.lastName}</div>}
            </div>
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="form-control"
            />
            {formErrors.email && <div className="text-danger small mt-1">{formErrors.email}</div>}
          </div>

          <div className="mb-3 position-relative">
            <input
              type={formState.showPassword ? "text" : "password"}
              name="password"
              value={formState.password}
              onChange={handleInputChange}
              placeholder="Password (min 8 chars)"
              className="form-control"
              minLength={8}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={togglePasswordVisibility}
            >
              {formState.showPassword ? "Hide" : "Show"}
            </button>
            {formErrors.password && <div className="text-danger small mt-1">{formErrors.password}</div>}
          </div>

          <div className="mb-3 position-relative">
            <input
              type={formState.showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formState.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="form-control"
              minLength={8}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={toggleConfirmPasswordVisibility}
            >
              {formState.showConfirmPassword ? "Hide" : "Show"}
            </button>
            {formErrors.confirmPassword && <div className="text-danger small mt-1">{formErrors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : "Register"}
          </button>
        </form>

        <p className="text-center text-muted mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary text-decoration-none">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
