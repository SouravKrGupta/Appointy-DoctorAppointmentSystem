import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import {
  saveUploadedMedia,
  normalizeAppointmentRecord,
  normalizeImageRecord,
} from "../utils/media.js";
import { createNotification } from "../utils/notifications.js";
import {
  formatSlotLabel,
  releaseDoctorSlotForAppointment,
} from "../utils/appointment.js";
import { emitAppointmentEvent } from "../utils/socket.js";

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for adding Doctor
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Please enter a strong password" });
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Doctor image is required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new doctorModel({
      name,
      email,
      image: "",
      imageMediaId: null,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now()
    });

    const mediaPath = await saveUploadedMedia(imageFile);
    newDoctor.image = mediaPath;
    newDoctor.imageMediaId = mediaPath.split("/").pop();

    await newDoctor.save();

    res.status(200).json({ success: true, message: "Doctor Added" });

  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: 'Appointment not found' });
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { cancelled: true },
      { new: true }
    );

    await releaseDoctorSlotForAppointment(appointmentData);

    await createNotification({
      recipientRole: 'user',
      recipientId: appointmentData.userId,
      appointmentId: String(appointmentId),
      type: 'appointment-cancelled',
      title: 'Appointment cancelled by admin',
      message: `Your appointment with ${appointmentData.docData.name} on ${formatSlotLabel(
        appointmentData.slotDate,
        appointmentData.slotTime
      )} was cancelled by admin.`,
      meta: {
        doctorName: appointmentData.docData.name,
      },
    });

    await createNotification({
      recipientRole: 'doctor',
      recipientId: appointmentData.docId,
      appointmentId: String(appointmentId),
      type: 'appointment-cancelled',
      title: 'Appointment cancelled by admin',
      message: `The appointment with ${appointmentData.userData.name} on ${formatSlotLabel(
        appointmentData.slotDate,
        appointmentData.slotTime
      )} was cancelled by admin.`,
      meta: {
        userName: appointmentData.userData.name,
      },
    });

    emitAppointmentEvent({
      userId: appointmentData.userId,
      docId: appointmentData.docId,
      payload: {
        type: 'appointment-cancelled',
        appointmentId: String(appointmentId),
        appointment: normalizeAppointmentRecord(req, updatedAppointment),
      },
    });

    res.json({ success: true, message: 'Appointment Cancelled' });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password');
    res.json({
      success: true,
      doctors: doctors.map((doctor) => normalizeImageRecord(req, doctor)),
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({
      success: true,
      appointments: appointments.map((appointment) =>
        normalizeAppointmentRecord(req, appointment)
      ),
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments
        .reverse()
        .slice(0, 5)
        .map((appointment) => normalizeAppointmentRecord(req, appointment))
    };

    res.json({ success: true, dashData });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginAdmin, addDoctor, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard };
