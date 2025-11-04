import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: "", type: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalState, setModalState] = useState({
    show: false,
    mode: "",
    manager: null,
  });
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    showPassword: false,
  });

  const [employeeModal, setEmployeeModal] = useState({ show: false, manager: null });
  const [employees, setEmployees] = useState([]);

  const [attendanceModal, setAttendanceModal] = useState({ show: false, manager: null });
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [employeeAttendanceModal, setEmployeeAttendanceModal] = useState({
    show: false,
    employee: null,
  });
  const [employeeAttendance, setEmployeeAttendance] = useState([]);

  // Notification handler
  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "info" }), 3000);
  };

  // Fetch all managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/organization-admin/managers");
        setManagers(res.data.data || []);
      } catch {
        triggerNotification("Failed to load managers.", "danger");
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagers();
  }, []);

  // --- Modal Handlers ---
  const openCreateModal = () => {
    setFormData({ firstName: "", lastName: "", email: "", password: "", showPassword: false });
    setFormError("");
    setModalState({ show: true, mode: "create", manager: null });
  };

  const openEditModal = (manager) => {
    setFormData({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      password: "",
      showPassword: false,
    });
    setFormError("");
    setModalState({ show: true, mode: "edit", manager });
  };

  const closeModal = () => {
    setModalState({ show: false, mode: "", manager: null });
    setFormError("");
  };

  // Submit Create/Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { firstName, lastName, email, password } = formData;
    if (!firstName || !lastName || !email) {
      setFormError("All fields except password are required.");
      return;
    }
    if (modalState.mode === "create" && !password) {
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
      ...(password ? { password: password.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      if (modalState.mode === "create") {
        const res = await api.post("/organization-admin/managers", payload);
        setManagers((prev) => [...prev, res.data.data]);
        triggerNotification("Manager created successfully!", "success");
      } else {
        const res = await api.put(`/organization-admin/managers/${modalState.manager._id}`, payload);
        setManagers((prev) =>
          prev.map((m) => (m._id === modalState.manager._id ? res.data.data : m))
        );
        triggerNotification("Manager updated successfully!", "success");
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Manager Status
  const toggleStatus = async (_id) => {
    try {
      const res = await api.patch(`/organization-admin/managers/${_id}/status`);
      setManagers((prev) =>
        prev.map((m) => (m._id === _id ? { ...m, status: res.data.data.status } : m))
      );
      triggerNotification("Status updated!", "primary");
    } catch {
      triggerNotification("Failed to update status.", "danger");
    }
  };

  // Delete Manager
  const deleteManager = async (_id) => {
    try {
      await api.delete(`/organization-admin/managers/${_id}`);
      setManagers((prev) => prev.filter((m) => m._id !== _id));
      triggerNotification("Manager deleted successfully!", "warning");
    } catch {
      triggerNotification("Failed to delete manager.", "danger");
    }
  };

  // Employees Modal
  const openEmployeeModal = async (manager) => {
    try {
      const res = await api.get(`/organization-admin/managers/${manager._id}/employees`);
      setEmployees(res.data.data || []);
      setEmployeeModal({ show: true, manager });
    } catch {
      triggerNotification("Failed to fetch employees.", "danger");
    }
  };
  const closeEmployeeModal = () => {
    setEmployees([]);
    setEmployeeModal({ show: false, manager: null });
  };

  // Employee Attendance Modal
  const openEmployeeAttendance = async (emp) => {
    try {
      const res = await api.get(`/organization-admin/manager/employees/${emp._id}/attendance`);
      setEmployeeAttendance(res.data.attendance || []);
      setEmployeeAttendanceModal({ show: true, employee: emp });
    } catch {
      triggerNotification("Failed to fetch employee attendance.", "danger");
    }
  };
  const closeEmployeeAttendance = () => {
    setEmployeeAttendance([]);
    setEmployeeAttendanceModal({ show: false, employee: null });
  };

  // Manager Attendance Modal
  const openAttendanceModal = async (manager) => {
    try {
      const res = await api.get(`/organization-admin/managers/${manager._id}/attendance`);
      setAttendanceRecords(res.data.attendance || []);
      setAttendanceModal({ show: true, manager });
    } catch {
      triggerNotification("Failed to fetch attendance.", "danger");
    }
  };
  const closeAttendanceModal = () => {
    setAttendanceRecords([]);
    setAttendanceModal({ show: false, manager: null });
  };

  const handleAttendanceChange = (i, val) => {
    const updated = [...attendanceRecords];
    updated[i].status = val;
    setAttendanceRecords(updated);
  };
  const submitAttendance = async () => {
    try {
      for (let record of attendanceRecords) {
        await api.put(
          `/organization-admin/managers/${attendanceModal.manager._id}/attendance`,
          record
        );
      }
      triggerNotification("Attendance updated successfully!", "success");
      closeAttendanceModal();
    } catch {
      triggerNotification("Failed to update attendance.", "danger");
    }
  };

  if (isLoading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container-fluid py-4">
      {/* Notification */}
      {notification.msg && (
        <div
          className={`alert alert-${notification.type} shadow-sm position-fixed end-0 mt-5 me-3`}
          style={{ zIndex: 1055, minWidth: "280px" }}
        >
          {notification.msg}
        </div>
      )}

      <div className="mb-4 border-bottom p-3 d-flex justify-content-between align-items-center">
        <h3 className="fw-bold mb-0">Managers</h3>
        <button className="btn btn-primary btn-sm shadow-sm px-4" onClick={openCreateModal}>
          + Create Manager
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.length > 0 ? (
                  managers.map((m) => (
                    <tr key={m._id}>
                      <td>{m._id}</td>
                      <td>{m.firstName} {m.lastName}</td>
                      <td>{m.email}</td>
                      <td>
                        <span className={`badge ${m.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(m)}>Edit</button>
                          <button className={`btn btn-sm ${m.status === "Active" ? "btn-warning" : "btn-success"}`} onClick={() => toggleStatus(m._id)}>
                            {m.status === "Active" ? "Disable" : "Activate"}
                          </button>
                          <button className="btn btn-sm btn-info text-white" onClick={() => openAttendanceModal(m)}>Attendance</button>
                          <button className="btn btn-sm btn-success" onClick={() => openEmployeeModal(m)}>Employees</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteManager(m._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No managers found. Click "Create Manager" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Modals (Manager, Attendance, Employees, Employee Attendance) --- */}
      {/* Create/Edit Manager Modal */}
      {modalState.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{modalState.mode === "create" ? "Create Manager" : "Edit Manager"}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{modalState.mode === "edit" ? "New Password" : "Password"}</label>
                    <input type="password" className="form-control" placeholder={modalState.mode === "edit" ? "Leave blank to keep current password" : ""} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{modalState.mode === "create" ? "Create" : "Update"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Attendance Modal */}
      {attendanceModal.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Attendance: {attendanceModal.manager.firstName} {attendanceModal.manager.lastName}</h5>
                <button type="button" className="btn-close" onClick={closeAttendanceModal}></button>
              </div>
              <div className="modal-body">
                {attendanceRecords.length > 0 ? (
                  <table className="table table-sm">
                    <thead>
                      <tr><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((rec, i) => (
                        <tr key={i}>
                          <td>{new Date(rec.date).toLocaleDateString()}</td>
                          <td>
                            <select className="form-select form-select-sm" value={rec.status} onChange={(e) => handleAttendanceChange(i, e.target.value)}>
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-center text-muted py-3">No attendance records found.</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAttendanceModal}>Close</button>
                {attendanceRecords.length > 0 && <button className="btn btn-primary" onClick={submitAttendance}>Update</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Modal */}
      {employeeModal.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Employees under {employeeModal.manager.firstName} {employeeModal.manager.lastName}</h5>
                <button type="button" className="btn-close" onClick={closeEmployeeModal}></button>
              </div>
              <div className="modal-body">
                {employees.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((e) => (
                          <tr key={e._id}>
                            <td>{e._id}</td>
                            <td>{e.firstName} {e.lastName}</td>
                            <td>{e.email}</td>
                            <td><span className={`badge ${e.status === "Active" ? "bg-success" : "bg-secondary"}`}>{e.status}</span></td>
                            <td><button className="btn btn-sm btn-info text-white" onClick={() => openEmployeeAttendance(e)}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-center text-muted py-3">No employees found.</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeEmployeeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Attendance Modal */}
      {employeeAttendanceModal.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Attendance: {employeeAttendanceModal.employee.firstName} {employeeAttendanceModal.employee.lastName}</h5>
                <button type="button" className="btn-close" onClick={closeEmployeeAttendance}></button>
              </div>
              <div className="modal-body">
                {employeeAttendance.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle mb-0">
                      <thead className="table-primary">
                        <tr><th>Date</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {employeeAttendance.map((rec, i) => (
                          <tr key={i}>
                            <td>{new Date(rec.date).toLocaleDateString()}</td>
                            <td><span className={`badge ${rec.status === "Present" ? "bg-success" : "bg-danger"}`}>{rec.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-center text-muted py-3">No attendance records found.</p>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEmployeeAttendance}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
