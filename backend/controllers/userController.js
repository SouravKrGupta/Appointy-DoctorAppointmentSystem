import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import {
    saveUploadedMedia,
    normalizeAppointmentRecord,
    normalizeImageRecord,
} from "../utils/media.js"
import { createNotification } from "../utils/notifications.js"
import {
    formatSlotLabel,
    releaseDoctorSlotForAppointment,
} from "../utils/appointment.js"
import { emitAppointmentEvent } from "../utils/socket.js"

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        })

        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData: normalizeImageRecord(req, userData) })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            await userModel.findByIdAndUpdate(userId, {
                image: await saveUploadedMedia(imageFile)
            })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        const slotsBooked = docData.slots_booked || {}

        if (slotsBooked[slotDate]) {
            if (slotsBooked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }

            slotsBooked[slotDate].push(slotTime)
        } else {
            slotsBooked[slotDate] = [slotTime]
        }

        const userData = await userModel.findById(userId).select("-password")

        const doctorSnapshot = docData.toObject()
        delete doctorSnapshot.password
        delete doctorSnapshot.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: doctorSnapshot,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            payment: true
        }

        const savedAppointment = await new appointmentModel(appointmentData).save()

        await doctorModel.findByIdAndUpdate(docId, { slots_booked: slotsBooked })

        await createNotification({
            recipientRole: 'doctor',
            recipientId: docId,
            appointmentId: String(savedAppointment._id),
            type: 'appointment-booked',
            title: `New appointment booked by ${userData.name}`,
            message: `${userData.name} booked ${formatSlotLabel(slotDate, slotTime)}.`,
            meta: {
                userName: userData.name,
                doctorName: doctorSnapshot.name,
            },
        })

        emitAppointmentEvent({
            userId,
            docId,
            payload: {
                type: 'appointment-booked',
                appointmentId: String(savedAppointment._id),
                appointment: normalizeAppointmentRecord(req, savedAppointment),
            },
        })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
            appointmentId,
            { cancelled: true },
            { new: true }
        )

        await releaseDoctorSlotForAppointment(appointmentData)

        await createNotification({
            recipientRole: 'doctor',
            recipientId: appointmentData.docId,
            appointmentId: String(appointmentId),
            type: 'appointment-cancelled',
            title: `Appointment cancelled by ${appointmentData.userData.name}`,
            message: `${appointmentData.userData.name} cancelled ${formatSlotLabel(
                appointmentData.slotDate,
                appointmentData.slotTime
            )}.`,
            meta: {
                userName: appointmentData.userData.name,
                doctorName: appointmentData.docData.name,
            },
        })

        emitAppointmentEvent({
            userId: appointmentData.userId,
            docId: appointmentData.docId,
            payload: {
                type: 'appointment-cancelled',
                appointmentId: String(appointmentId),
                appointment: normalizeAppointmentRecord(req, updatedAppointment),
            },
        })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({
            success: true,
            appointments: appointments.map((appointment) =>
                normalizeAppointmentRecord(req, appointment)
            )
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Demo payment mode: mark appointments as paid without Razorpay.
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })

        res.json({ success: true, message: 'Payment marked as done in demo mode' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Demo payment verification endpoint kept for frontend compatibility.
const verifyRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body

        if (appointmentId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
        }

        res.json({ success: true, message: "Payment Successful" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay }
