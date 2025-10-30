import User from "../model/user.js";
import bcrypt from "bcryptjs";

export const createOrganizationAdmin = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const existingOrganizationAdmin = await User.findOne({
      email,
      role: "organization-admin",
    });

    if (existingOrganizationAdmin) {
      return res.status(400).json({
        status: "fail",
        message: "Organization Admin with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOrganizationAdmin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "organization-admin",
      status: "Active",
    });

    const savedOrganizationAdmin = await newOrganizationAdmin.save();

    return res.status(201).json({
      status: "success",
      message: "Organization Admin created successfully",
      data: {
        _id: savedOrganizationAdmin._id,
        firstName: savedOrganizationAdmin.firstName,
        lastName: savedOrganizationAdmin.lastName,
        email: savedOrganizationAdmin.email,
        role: savedOrganizationAdmin.role,
        status: savedOrganizationAdmin.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateOrganizationAdmin = async (req, res) => {
  const { _id } = req.params;
  const { firstName, lastName, email, password } = req.body;

  try {
    const organizationAdmin = await User.findById(_id);

    if (!organizationAdmin || organizationAdmin.role !== "organization-admin") {
      return res.status(404).json({
        status: "fail",
        message: "Organization Admin not found",
      });
    }

    if (email && email !== organizationAdmin.email) {
      const existingUser = await User.findOne({
        email,
        role: "organization-admin",
      });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          message: "Email already exists",
        });
      }
      organizationAdmin.email = email;
    }

    if (firstName) organizationAdmin.firstName = firstName;
    if (lastName) organizationAdmin.lastName = lastName;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      organizationAdmin.password = await bcrypt.hash(password, salt);
    }

    const updatedOrganizationAdmin = await organizationAdmin.save();

    return res.status(200).json({
      status: "success",
      message: "Organization Admin updated successfully",
      data: {
        _id: updatedOrganizationAdmin._id,
        firstName: updatedOrganizationAdmin.firstName,
        lastName: updatedOrganizationAdmin.lastName,
        email: updatedOrganizationAdmin.email,
        role: updatedOrganizationAdmin.role,
        status: updatedOrganizationAdmin.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteOrganizationAdmin = async (req, res) => {
  const { _id } = req.params;

  try {
    const organizationAdmin = await User.findById(_id);

    if (!organizationAdmin || organizationAdmin.role !== "organization-admin") {
      return res.status(404).json({
        status: "fail",
        message: "Organization Admin not found",
      });
    }

    await organizationAdmin.deleteOne();

    return res.status(200).json({
      status: "success",
      message: "Organization Admin deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllOrganizationAdmins = async (req, res) => {
  try {
    const organizationAdmins = await User.find({
      role: "organization-admin",
    })
      .select("-password")
      .sort({ firstName: 1, lastName: 1 });

    return res.status(200).json({
      status: "success",
      message: "Organization Admins fetched successfully",
      results: organizationAdmins.length,
      data: organizationAdmins,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const toggleOrganizationAdminStatus = async (req, res) => {
  const { _id } = req.params;

  try {
    const organizationAdmin = await User.findById(_id);

    if (!organizationAdmin || organizationAdmin.role !== "organization-admin") {
      return res.status(404).json({
        status: "fail",
        message: "Organization Admin not found",
      });
    }

    organizationAdmin.status =
      organizationAdmin.status === "Active" ? "Disabled" : "Active";

    const updatedOrganizationAdmin = await organizationAdmin.save();

    return res.status(200).json({
      status: "success",
      message: `Organization Admin status updated to ${updatedOrganizationAdmin.status}`,
      data: {
        _id: updatedOrganizationAdmin._id,
        firstName: updatedOrganizationAdmin.firstName,
        lastName: updatedOrganizationAdmin.lastName,
        email: updatedOrganizationAdmin.email,
        role: updatedOrganizationAdmin.role,
        status: updatedOrganizationAdmin.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
