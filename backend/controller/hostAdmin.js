import User from "../model/user.js";
import bcrypt from "bcryptjs";

export const registerHostAdmin = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const hostAdmin = await User.findOne({ email, role: "host-admin" });
    if (hostAdmin) {
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
      message: "Host Admin registered successfully",
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
