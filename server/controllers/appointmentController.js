const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @desc    Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (date) {
      const d = new Date(date);
      query.appointmentDate = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    // If patient role, only show own appointments
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patientId = patient._id;
    }
    // If doctor role, only show own appointments
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) query.doctorId = doctor._id;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name patientId phone email')
      .populate('doctorId', 'name doctorId specialization consultationFee')
      .populate('departmentId', 'departmentName')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: appointments, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name patientId phone email dateOfBirth gender bloodGroup address')
      .populate('doctorId', 'name doctorId specialization consultationFee departmentId')
      .populate('departmentId', 'departmentName');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check availability
exports.checkAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ success: false, message: 'Doctor and date are required' });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availability.days.includes(dayOfWeek)) {
      return res.json({ success: true, data: { available: false, slots: [], message: `Doctor is not available on ${dayOfWeek}` } });
    }

    // Generate time slots
    const slots = [];
    const [startH, startM] = doctor.availability.startTime.split(':').map(Number);
    const [endH, endM] = doctor.availability.endTime.split(':').map(Number);
    const duration = doctor.availability.slotDuration || 30;
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      current += duration;
    }

    // Find booked slots
    const d = new Date(date);
    const booked = await Appointment.find({
      doctorId, appointmentDate: { $gte: d, $lt: new Date(d.getTime() + 86400000) },
      status: { $in: ['Pending', 'Confirmed', 'In-Progress'] }
    }).select('appointmentTime');
    const bookedTimes = booked.map(a => a.appointmentTime);
    const availableSlots = slots.filter(s => !bookedTimes.includes(s));

    res.json({ success: true, data: { available: availableSlots.length > 0, slots: availableSlots, bookedSlots: bookedTimes, allSlots: slots } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, departmentId, appointmentDate, appointmentTime, reason } = req.body;
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Patient, doctor, date and time are required' });
    }

    // Prevent past dates
    const aptDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (aptDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointment in the past' });
    }

    // Check duplicate booking
    const existing = await Appointment.findOne({
      doctorId, appointmentDate: { $gte: aptDate, $lt: new Date(aptDate.getTime() + 86400000) },
      appointmentTime, status: { $in: ['Pending', 'Confirmed', 'In-Progress'] }
    });
    if (existing) return res.status(409).json({ success: false, message: 'This time slot is already booked' });

    const appointment = await Appointment.create({
      patientId, doctorId, departmentId, appointmentDate: aptDate, appointmentTime, reason, status: 'Confirmed'
    });

    // Create notification for patient
    const patient = await Patient.findById(patientId);
    if (patient) {
      await Notification.create({
        userId: patient.userId, title: 'Appointment Confirmed',
        message: `Your appointment on ${aptDate.toLocaleDateString()} at ${appointmentTime} has been confirmed. Token: ${appointment.tokenNumber}`,
        type: 'appointment'
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name doctorId specialization');

    res.status(201).json({ success: true, message: `Appointment booked. Token #${appointment.tokenNumber}`, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    Object.assign(appointment, req.body);
    await appointment.save();
    res.json({ success: true, message: 'Appointment updated', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = status;
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();

    // Notify patient
    const patient = await Patient.findById(appointment.patientId);
    if (patient) {
      await Notification.create({
        userId: patient.userId, title: `Appointment ${status}`,
        message: `Your appointment ${appointment.appointmentId} has been ${status.toLowerCase()}.`,
        type: 'appointment'
      });
    }

    res.json({ success: true, message: `Appointment ${status}`, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
