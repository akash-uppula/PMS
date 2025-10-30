import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: "", type: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [employeeModal, setEmployeeModal] = useState({
    show: false,
    mode: "",
    employee: null,
  });

  const [attendanceModal, setAttendanceModal] = useState({
    show: false,
    employee: null,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    salary: "",
    accessLevel: "",
    showPassword: false,
  });

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const accessLevels = [
    "Trainee",
    "Junior Employee",
    "Senior Employee",
    "Team Lead",
    "Supervisor",
  ];

  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/manager/employees");
        setEmployees(res.data.data || []);
      } catch {
        triggerNotification("Failed to load employees.", "danger");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      salary: "",
      accessLevel: "",
      showPassword: false,
    });
    setFormError("");
    setEmployeeModal({ show: true, mode: "create", employee: null });
  };

  const openEditModal = (emp) => {
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: "",
      salary: emp.salary,
      accessLevel: emp.accessLevel,
      showPassword: false,
    });
    setFormError("");
    setEmployeeModal({ show: true, mode: "edit", employee: emp });
  };

  const closeEmployeeModal = () =>
    setEmployeeModal({ show: false, mode: "", employee: null });

  const openAttendanceModal = async (emp) => {
    try {
      const res = await api.get(`/manager/employees/${emp._id}/attendance`);
      setAttendanceRecords(res.data.attendance || []);
      setAttendanceModal({ show: true, employee: emp });
    } catch {
      triggerNotification("Failed to fetch attendance.", "danger");
    }
  };

  const closeAttendanceModal = () => {
    setAttendanceModal({ show: false, employee: null });
    setAttendanceRecords([]);
  };

  // Employee form submit
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { firstName, lastName, email, password, salary, accessLevel } =
      formData;

    if (!firstName || !lastName || !email || !salary || !accessLevel) {
      setFormError("All fields except password are required.");
      return;
    }
    if (employeeModal.mode === "create" && !password) {
      setFormError("Password is required.");
      return;
    }
    if (password && password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      salary,
      accessLevel,
      ...(password ? { password: password.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      if (employeeModal.mode === "create") {
        const res = await api.post("/manager/employees", payload);
        setEmployees((prev) => [...prev, res.data.data]);
        triggerNotification("Employee created successfully!", "success");
      } else {
        const res = await api.put(
          `/manager/employees/${employeeModal.employee._id}`,
          payload
        );
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employeeModal.employee._id ? res.data.data : emp
          )
        );
        triggerNotification("Employee updated successfully!", "success");
      }
      closeEmployeeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmployeeStatus = async (_id) => {
    try {
      const res = await api.patch(`/manager/employees/${_id}/status`);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === _id ? { ...emp, status: res.data.data.status } : emp
        )
      );
      triggerNotification("Status updated!", "primary");
    } catch {
      triggerNotification("Failed to update status.", "danger");
    }
  };

  const deleteEmployee = async (_id) => {
    try {
      await api.delete(`/manager/employees/${_id}`);
      setEmployees((prev) => prev.filter((emp) => emp._id !== _id));
      triggerNotification("Employee deleted successfully!", "warning");
    } catch {
      triggerNotification("Failed to delete employee.", "danger");
    }
  };

  const handleAttendanceChange = (i, value) => {
    const updated = [...attendanceRecords];
    updated[i].status = value;
    setAttendanceRecords(updated);
  };

  const handleAttendanceSubmit = async () => {
    try {
      for (let record of attendanceRecords) {
        await api.put(
          `/manager/employees/${attendanceModal.employee._id}/attendance`,
          record
        );
      }
      triggerNotification("Attendance updated successfully!", "success");
      closeAttendanceModal();
    } catch {
      triggerNotification("Failed to update attendance.", "danger");
    }
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
      {/* Notifications */}
      {notification.msg && (
        <div
          className={`alert alert-${notification.type} shadow-sm position-fixed end-0 mt-5 me-3`}
          role="alert"
          style={{ zIndex: 1055, minWidth: "280px" }}
        >
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 border-bottom p-3">
        <h3 className="fw-bold mb-3 text-center">Employees</h3>
        <button
          className="btn btn-primary btn-sm shadow-sm px-4"
          onClick={openCreateModal}
        >
          + Create Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Salary</th>
                  <th>Access Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length ? (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp._id}</td>
                      <td>
                        <strong>
                          {emp.firstName} {emp.lastName}
                        </strong>
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.salary}</td>
                      <td>{emp.accessLevel}</td>
                      <td>
                        <span
                          className={`badge ${
                            emp.status === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openEditModal(emp)}
                          >
                            Edit
                          </button>
                          <button
                            className={`btn btn-sm ${
                              emp.status === "Active"
                                ? "btn-danger"
                                : "btn-success"
                            }`}
                            onClick={() => toggleEmployeeStatus(emp._id)}
                          >
                            {emp.status === "Active" ? "Disable" : "Activate"}
                          </button>
                          <button
                            className="btn btn-sm btn-info text-white"
                            onClick={() => openAttendanceModal(emp)}
                          >
                            Attendance
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteEmployee(emp._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No employees found. Click "Create Employee" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {employeeModal.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {employeeModal.mode === "create"
                    ? "Create Employee"
                    : "Edit Employee"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEmployeeModal}
                ></button>
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger">{formError}</div>
                )}
                <form onSubmit={handleEmployeeSubmit}>
                  {["firstName", "lastName", "email"].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field}
                      </label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        className="form-control"
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                      />
                    </div>
                  ))}

                  <div className="mb-3">
                    <label className="form-label">
                      {employeeModal.mode === "edit"
                        ? "New Password"
                        : "Password"}
                    </label>
                    <div className="input-group">
                      <input
                        type={formData.showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder={
                          employeeModal.mode === "edit"
                            ? "Leave blank to keep current password"
                            : "Enter password"
                        }
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            showPassword: !formData.showPassword,
                          })
                        }
                      >
                        {formData.showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Access Level</label>
                    <select
                      className="form-select"
                      value={formData.accessLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accessLevel: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Access Level</option>
                      {accessLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={closeEmployeeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? employeeModal.mode === "create"
                          ? "Creating..."
                          : "Updating..."
                        : employeeModal.mode === "create"
                        ? "Create"
                        : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModal.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-sm border-0 rounded-3">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">
                  Attendance: {attendanceModal.employee.firstName}{" "}
                  {attendanceModal.employee.lastName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAttendanceModal}
                ></button>
              </div>
              <div className="modal-body">
                {attendanceRecords.length ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((rec, i) => (
                          <tr key={i}>
                            <td>{new Date(rec.date).toLocaleDateString()}</td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={rec.status}
                                onChange={(e) =>
                                  handleAttendanceChange(i, e.target.value)
                                }
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted mb-0">
                    No attendance records found.
                  </p>
                )}
              </div>
              <div className="modal-footer border-top-0 justify-content-end">
                <button
                  className="btn btn-secondary"
                  onClick={closeAttendanceModal}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAttendanceSubmit}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
