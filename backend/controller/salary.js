import User from "../model/user.js";

const HOLIDAYS = [
  "2025-01-01",
  "2025-01-26",
  "2025-03-08",
  "2025-08-15",
  "2025-10-02",
  "2025-12-25",
];

export const getEmployeeSalaryByAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const employee = await User.findOne({ _id: id, role: "employee" }).select(
      "firstName lastName salary attendance managerId"
    );

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found",
      });
    }

    if (employee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Access denied: You can only view your own employees’ salary",
      });
    }

    const attendanceRecords = employee.attendance || [];

    let filteredAttendance = attendanceRecords;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filteredAttendance = attendanceRecords.filter(
        (record) => record.date >= start && record.date <= end
      );
    }

    const totalPresentDays = filteredAttendance.filter(
      (record) => record.status === "Present"
    ).length;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const allDates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
    }

    const holidayDates = HOLIDAYS.map((d) => new Date(d).toDateString());
    const workingDays = allDates.filter((d) => {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6; // Sunday or Saturday
      const isHoliday = holidayDates.includes(d.toDateString());
      return !isWeekend && !isHoliday;
    });

    const totalWorkingDays = workingDays.length;

    if (totalWorkingDays <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid date range: no working days found",
      });
    }

    const perDaySalary = employee.salary / totalWorkingDays;
    const attendanceSalary = perDaySalary * totalPresentDays;

    return res.status(200).json({
      status: "success",
      message: "Attendance-based salary calculated successfully",
      data: {
        employee: `${employee.firstName} ${employee.lastName}`,
        fixedSalary: employee.salary,
        totalDays:totalWorkingDays,
        totalPresentDays,
        absentDays: totalWorkingDays - totalPresentDays,
        perDaySalary: perDaySalary.toFixed(2),
        finalSalary: attendanceSalary.toFixed(2),
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
export const getManagerSalaryByAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const manager = await User.findOne({ _id: id, role: "manager" }).select(
      "firstName lastName salary attendance"
    );

    if (!manager) {
      return res.status(404).json({
        status: "fail",
        message: "Manager not found",
      });
    }

    if (req.user.role !== "organization-admin") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied: Only organization admin can view manager salary",
      });
    }

    const fixedSalary = manager.salary || 100000;

    const attendanceRecords = manager.attendance || [];

    let filteredAttendance = attendanceRecords;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filteredAttendance = attendanceRecords.filter(
        (record) => record.date >= start && record.date <= end
      );
    }

    const totalPresentDays = filteredAttendance.filter(
      (record) => record.status === "Present"
    ).length;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const allDates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
    }

    const holidayDates = HOLIDAYS.map((d) => new Date(d).toDateString());
    const workingDays = allDates.filter((d) => {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6;
      const isHoliday = holidayDates.includes(d.toDateString());
      return !isWeekend && !isHoliday;
    });

    const totalWorkingDays = workingDays.length;

    if (totalWorkingDays <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid date range: no working days found",
      });
    }

    const perDaySalary = fixedSalary / totalWorkingDays;
    const attendanceSalary = perDaySalary * totalPresentDays;

    return res.status(200).json({
      status: "success",
      message: "Attendance-based salary calculated successfully for manager",
      data: {
        manager: `${manager.firstName} ${manager.lastName}`,
        fixedSalary,
        totalDays: totalWorkingDays,
        totalPresentDays,
        absentDays: totalWorkingDays - totalPresentDays,
        perDaySalary: perDaySalary.toFixed(2),
        finalSalary: attendanceSalary.toFixed(2),
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