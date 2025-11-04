import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["host-admin", "organization-admin", "manager", "employee"],
      default: "host-admin",
    },
    status: {
      type: String,
      enum: ["Active", "Disabled"],
      default: "Active",
    },
    salary: {
      type: Number,
      min: [0, "Salary must be a positive number"],
    },
    accessLevel: {
      type: String,
      enum: [
        "Trainee",
        "Junior Employee",
        "Senior Employee",
        "Team Lead",
        "Supervisor",
      ],
      default: "Trainee",
    },
    organizationAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attendance: {
      type: [
        {
          date: { type: Date, required: true },
          status: {
            type: String,
            enum: ["Present", "Absent", "Leave"],
            required: true,
            default: "Absent",
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
