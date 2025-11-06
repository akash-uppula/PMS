import User from "../model/user.js";
import bcrypt from "bcryptjs";

export const createHostAdmin = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const existingHostAdmin = await User.findOne({ role: "host-admin" });
    if (existingHostAdmin) {
      return res.status(400).json({
        status: "fail",
        message:
          "A Host Admin already exists. Only one Host Admin is allowed in the system.",
      });
    }

    const existingHostAdminEmail = await User.findOne({
      email,
      role: "host-admin",
    });
    if (existingHostAdminEmail) {
      return res.status(400).json({
        status: "fail",
        message: "Host Admin with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newHostAdmin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "host-admin",
      status: "Active",
    });

    const savedHostAdmin = await newHostAdmin.save();

    return res.status(201).json({
      status: "success",
      message: "Host Admin created successfully",
      data: {
        _id: savedHostAdmin._id,
        firstName: savedHostAdmin.firstName,
        lastName: savedHostAdmin.lastName,
        email: savedHostAdmin.email,
        role: savedHostAdmin.role,
        status: savedHostAdmin.status,
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

export const updateHostAdmin = async (req, res) => {
  const { _id } = req.params;
  const { firstName, lastName, email, password } = req.body;

  try {
    const hostAdmin = await User.findById(_id);

    if (!hostAdmin || hostAdmin.role !== "host-admin") {
      return res.status(404).json({
        status: "fail",
        message: "Host Admin not found",
      });
    }

    if (email && email !== hostAdmin.email) {
      const existingUser = await User.findOne({
        email,
        role: "host-admin",
      });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          message: "Email already exists",
        });
      }
      hostAdmin.email = email;
    }

    if (firstName) hostAdmin.firstName = firstName;
    if (lastName) hostAdmin.lastName = lastName;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      hostAdmin.password = await bcrypt.hash(password, salt);
    }

    const updatedHostAdmin = await hostAdmin.save();

    return res.status(200).json({
      status: "success",
      message: "Host Admin updated successfully",
      data: {
        _id: updatedHostAdmin._id,
        firstName: updatedHostAdmin.firstName,
        lastName: updatedHostAdmin.lastName,
        email: updatedHostAdmin.email,
        role: updatedHostAdmin.role,
        status: updatedHostAdmin.status,
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

export const deleteHostAdmin = async (req, res) => {
  const { _id } = req.params;

  try {
    const hostAdmin = await User.findById(_id);

    if (!hostAdmin || hostAdmin.role !== "host-admin") {
      return res.status(404).json({
        status: "fail",
        message: "Host Admin not found",
      });
    }

    await hostAdmin.deleteOne();

    return res.status(200).json({
      status: "success",
      message: "Host Admin deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllHostAdmins = async (req, res) => {
  try {
    const hostAdmins = await User.find({
      role: "host-admin",
    })
      .select("-password")
      .sort({ firstName: 1, lastName: 1 });

    return res.status(200).json({
      status: "success",
      message: "Host Admins fetched successfully",
      results: hostAdmins.length,
      data: hostAdmins,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const checkHostAdminExists = async (req, res) => {
  try {
    const hostAdmin = await User.findOne({ role: "host-admin" });

    return res.status(200).json({
      status: "success",
      exists: !!hostAdmin,
    });
  } catch (error) {
    console.error("Error checking host admin existence:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};