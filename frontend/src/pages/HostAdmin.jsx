import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const HostAdmin = () => {
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

  const triggerNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await api.get("/host-admin/hostAdmins");
        setAdmins(res.data.data || []);
      } catch {
        triggerNotification("Failed to load Host Admins.", "danger");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, []);

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

  const closeModal = () => setModalState({ show: false, mode: "", admin: null });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { firstName, lastName, email, password } = formData;

    if (!firstName || !lastName || !email) {
      setFormError("First Name, Last Name, and Email are required.");
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
      const res = await api.put(
        `/host-admin/update/${modalState.admin._id}`,
        payload
      );
      setAdmins((prev) =>
        prev.map((a) => (a._id === modalState.admin._id ? res.data.data : a))
      );
      triggerNotification("Host Admin updated successfully!", "success");
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAdmin = async (_id) => {
    try {
      await api.delete(`/host-admin/delete/${_id}`);
      setAdmins((prev) => prev.filter((admin) => admin._id !== _id));
      triggerNotification("Host Admin deleted!", "warning");
    } catch {
      triggerNotification("Failed to delete Host Admin.", "danger");
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
      {notification.msg && (
        <div
          className={`alert alert-${notification.type} shadow-sm position-fixed end-0 mt-5 me-3`}
          role="alert"
          style={{ zIndex: 1055, minWidth: "280px" }}
        >
          {notification.msg}
        </div>
      )}

      <div className="mb-4 border-bottom p-3">
        <h3 className="fw-bold mb-3 text-center">Host Admin</h3>
      </div>

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
                      <div className="fw-semibold">No Host Admin found</div>
                      <small className="text-secondary">
                        Only one Host Admin is allowed.
                      </small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalState.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-sm border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Host Admin</h5>
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
                    <label className="form-label">New Password</label>
                    <div className="input-group">
                      <input
                        type={formData.showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Leave blank to keep current password"
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
                      {isSubmitting ? "Updating..." : "Update"}
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

export default HostAdmin;
