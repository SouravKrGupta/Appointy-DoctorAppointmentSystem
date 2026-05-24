import doctorModel from "../models/doctorModel.js";

const months = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatSlotDate = (slotDate = "") => {
  const [day, month, year] = slotDate.split("_");

  if (!day || !month || !year) {
    return slotDate;
  }

  return `${day} ${months[Number(month)]} ${year}`;
};

const formatSlotLabel = (slotDate = "", slotTime = "") =>
  `${formatSlotDate(slotDate)}${slotTime ? ` at ${slotTime}` : ""}`;

const releaseDoctorSlotForAppointment = async (appointment) => {
  if (!appointment?.docId || !appointment?.slotDate || !appointment?.slotTime) {
    return;
  }

  const doctorData = await doctorModel.findById(appointment.docId);

  if (!doctorData) {
    return;
  }

  const slotsBooked = doctorData.slots_booked || {};

  if (!slotsBooked[appointment.slotDate]) {
    return;
  }

  slotsBooked[appointment.slotDate] = slotsBooked[appointment.slotDate].filter(
    (slot) => slot !== appointment.slotTime
  );

  if (!slotsBooked[appointment.slotDate].length) {
    delete slotsBooked[appointment.slotDate];
  }

  await doctorModel.findByIdAndUpdate(appointment.docId, {
    slots_booked: slotsBooked,
  });
};

export { formatSlotDate, formatSlotLabel, releaseDoctorSlotForAppointment };
