const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Medicine = require('../models/Medicine');
const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [totalPatients, totalDoctors, totalNurses, totalAppointments, todayAppointments,
      pendingAppointments, completedAppointments, totalRevenue, totalDepartments, totalMedicines] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Nurse.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Bill.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Department.countDocuments(),
      Medicine.countDocuments()
    ]);

    res.json({
      success: true, data: {
        totalPatients, totalDoctors, totalNurses, totalAppointments, todayAppointments,
        pendingAppointments, completedAppointments, totalDepartments, totalMedicines,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Appointment report
exports.getAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.appointmentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const statusCounts = await Appointment.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const departmentCounts = await Appointment.aggregate([
      { $match: query },
      { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dept.departmentName', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { statusCounts, departmentCounts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const monthlyRevenue = await Bill.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$billDate' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }, { $limit: 12 }
    ]);
    const categoryRevenue = await Bill.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', total: { $sum: '$items.amount' } } }
    ]);
    res.json({ success: true, data: { monthlyRevenue, categoryRevenue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patient report
exports.getPatientReport = async (req, res) => {
  try {
    const genderDist = await Patient.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);
    const bloodGroupDist = await Patient.aggregate([
      { $match: { bloodGroup: { $ne: '' } } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);
    const monthlyReg = await Patient.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }, { $limit: 12 }
    ]);
    res.json({ success: true, data: { genderDist, bloodGroupDist, monthlyReg } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
