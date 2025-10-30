import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const OrganizationAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: "", type: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    showPassword: false,
  });

  const [modalState, setModalState] = useState({
    show: false,
    mode: "",
    admin: null,
  });

  // Notification helper
  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3000);
  };

  // Fetch admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await api.get("/host-admin/organization-admins");
        setAdmins(res.data.data || []);
      } catch {
        triggerNotification("Failed to load admins.", "danger");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      showPassword: false,
    });
    setFormError("");
    setModalState({ show: true, mode: "create", admin: null });
  };

  const openEditModal = (admin) => {
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: "",
      showPassword: false,
    });
    setFormError("");
    setModalState({ show: true, mode: "edit", admin });
  };

  const closeModal = () =>
    setModalState({ show: false, mode: "", admin: null });

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { firstName, lastName, email, password } = formData;

    if (!firstName || !lastName || !email) {
      setFormError("First Name, Last Name, and Email are required.");
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
      firstName,
      lastName,
      email,
      ...(password ? { password } : {}),
    };
    setIsSubmitting(true);

    try {
      if (modalState.mode === "create") {
        const res = await api.post("/host-admin/organization-admins", payload);
        setAdmins((prev) => [...prev, res.data.data]);
        triggerNotification(
          "Organization Admin created successfully!",
          "success"
        );
      } else {
        const res = await api.put(
          `/host-admin/organization-admins/${modalState.admin._id}`,
          payload
        );
        setAdmins((prev) =>
          prev.map((a) => (a._id === modalState.admin._id ? res.data.data : a))
        );
        triggerNotification(
          "Organization Admin updated successfully!",
          "success"
        );
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status
  const toggleAdminStatus = async (_id) => {
    try {
      const res = await api.patch(
        `/host-admin/organization-admins/${_id}/status`
      );
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === _id ? { ...admin, status: res.data.data.status } : admin
        )
      );
      triggerNotification("Status updated!", "primary");
    } catch {
      triggerNotification("Failed to update status.", "danger");
    }
  };

  // Delete
  const deleteAdmin = async (_id) => {
    try {
      await api.delete(`/host-admin/organization-admins/${_id}`);
      setAdmins((prev) => prev.filter((admin) => admin._id !== _id));
      triggerNotification("Organization Admin deleted!", "warning");
    } catch {
      triggerNotification("Failed to delete admin.", "danger");
    }
  };

  if (isLoading)
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

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
        <h3 className="fw-bold mb-3 text-center">Organization Admins</h3>
        <button
          className="btn btn-primary btn-sm shadow-sm px-4"
          onClick={openCreateModal}
        >
          + Create Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-3 fw-semibold">ID</th>
                  <th className="px-3 py-3 fw-semibold">Name</th>
                  <th className="px-3 py-3 fw-semibold">Email</th>
                  <th className="px-3 py-3 fw-semibold">Status</th>
                  <th className="px-3 py-3 fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length ? (
                  admins.map((admin) => (
                    <tr key={admin._id}>
                      <td className="px-3">{admin._id}</td>
                      <td className="px-3">
                        {admin.firstName} {admin.lastName}
                      </td>
                      <td className="px-3">{admin.email}</td>
                      <td className="px-3">
                        <span
                          className={`badge ${
                            admin.status === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-3">
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openEditModal(admin)}
                          >
                            Edit
                          </button>
                          <button
                            className={`btn btn-sm ${
                              admin.status === "Active"
                                ? "btn-danger"
                                : "btn-success"
                            }`}
                            onClick={() => toggleAdminStatus(admin._id)}
                          >
                            {admin.status === "Active" ? "Disable" : "Activate"}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteAdmin(admin._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <div className="fw-semibold">No admins found</div>
                      <small className="text-secondary">
                        Click "Create Admin" to add one.
                      </small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalState.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalState.mode === "create" ? "Create Admin" : "Edit Admin"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger">{formError}</div>
                )}
                <form onSubmit={handleFormSubmit}>
                  {["firstName", "lastName", "email"].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field}
                      </label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        className="form-control"
                        placeholder={`Enter ${field}`}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label">
                      {modalState.mode === "edit" ? "New Password" : "Password"}
                    </label>
                    <div className="input-group">
                      <input
                        type={formData.showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder={
                          modalState.mode === "edit"
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
                  <div className="text-end mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? modalState.mode === "create"
                          ? "Creating..."
                          : "Updating..."
                        : modalState.mode === "create"
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
    </div>
  );
};

export default OrganizationAdmins;
