import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
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

// Doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's appointments
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.user.id;
    const appointments = await appointmentModel.find({ docId });
    res.json({
      success: true,
      appointments: appointments.map((appointment) =>
        normalizeAppointmentRecord(req, appointment)
      ),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.user.id;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Invalid doctor or appointment" });
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { cancelled: true },
      { new: true }
    );

    await releaseDoctorSlotForAppointment(appointment);

    await createNotification({
      recipientRole: "user",
      recipientId: appointment.userId,
      appointmentId: String(appointmentId),
      type: "appointment-cancelled",
      title: `Appointment cancelled by ${appointment.docData.name}`,
      message: `${appointment.docData.name} cancelled your appointment for ${formatSlotLabel(
        appointment.slotDate,
        appointment.slotTime
      )}.`,
      meta: {
        doctorName: appointment.docData.name,
      },
    });

    emitAppointmentEvent({
      userId: appointment.userId,
      docId: appointment.docId,
      payload: {
        type: "appointment-cancelled",
        appointmentId: String(appointmentId),
        appointment: normalizeAppointmentRecord(req, updatedAppointment),
      },
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete appointment
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.user.id;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Invalid doctor or appointment" });
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { isCompleted: true },
      { new: true }
    );

    await createNotification({
      recipientRole: "user",
      recipientId: appointment.userId,
      appointmentId: String(appointmentId),
      type: "appointment-completed",
      title: `Appointment completed with ${appointment.docData.name}`,
      message: `${appointment.docData.name} marked your ${formatSlotLabel(
        appointment.slotDate,
        appointment.slotTime
      )} appointment as completed.`,
      meta: {
        doctorName: appointment.docData.name,
      },
    });

    emitAppointmentEvent({
      userId: appointment.userId,
      docId: appointment.docId,
      payload: {
        type: "appointment-completed",
        appointmentId: String(appointmentId),
        appointment: normalizeAppointmentRecord(req, updatedAppointment),
      },
    });

    res.json({ success: true, message: "Appointment Completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all doctors (for frontend list)
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password -email");
    res.json({
      success: true,
      doctors: doctors.map((doctor) => normalizeImageRecord(req, doctor)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle doctor's availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID missing" });
    }

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    res.json({ success: true, message: "Availability changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's profile
const doctorProfile = async (req, res) => {
  try {
    const docId = req.user.id;
    const profile = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData: normalizeImageRecord(req, profile) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor's profile
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.user.id;
    const { fees, address, available, about } = req.body;
    const imageFile = req.file;
    const existingDoctor = await doctorModel.findById(docId);

    if (!existingDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    let parsedAddress = existingDoctor.address;

    if (typeof address === "string" && address.trim()) {
      try {
        parsedAddress = JSON.parse(address);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid address format" });
      }
    } else if (address && typeof address === "object") {
      parsedAddress = address;
    }

    const parsedFees =
      fees === undefined || fees === null || fees === ""
        ? existingDoctor.fees
        : Number(fees);

    if (Number.isNaN(parsedFees)) {
      return res.status(400).json({ success: false, message: "Invalid consultation fee" });
    }

    const updateData = {
      fees: parsedFees,
      address: parsedAddress,
      available:
        available === undefined
          ? existingDoctor.available
          : available === true || available === "true",
      about: about ?? existingDoctor.about,
    };

    if (imageFile) {
      const mediaPath = await saveUploadedMedia(imageFile);
      updateData.image = mediaPath;
      updateData.imageMediaId = mediaPath.split("/").pop();
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const doctorSnapshot = updatedDoctor.toObject();
    delete doctorSnapshot.password;
    delete doctorSnapshot.slots_booked;

    await appointmentModel.updateMany(
      { docId },
      {
        $set: {
          docData: doctorSnapshot,
        },
      }
    );

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard data
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.user.id;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    const patientSet = new Set();

    appointments.forEach((appointment) => {
      if (appointment.isCompleted || appointment.payment) earnings += appointment.amount;
      patientSet.add(appointment.userId.toString());
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patientSet.size,
      latestAppointments: appointments
        .reverse()
        .slice(0, 5)
        .map((appointment) => normalizeAppointmentRecord(req, appointment)),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  changeAvailability,
  doctorProfile,
  updateDoctorProfile,
  doctorDashboard,
};
