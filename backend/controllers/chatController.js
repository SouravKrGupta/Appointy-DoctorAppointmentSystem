import appointmentModel from "../models/appointmentModel.js";
import chatMessageModel from "../models/chatMessageModel.js";
import { normalizeAppointmentRecord } from "../utils/media.js";
import { createNotification, markNotificationsAsRead } from "../utils/notifications.js";
import { formatSlotLabel } from "../utils/appointment.js";
import { emitToParticipant } from "../utils/socket.js";

const getParticipantFromRequest = (req) => req.user || null;

const normalizeChatMessage = (message, role) => {
  const plainMessage =
    typeof message?.toObject === "function" ? message.toObject() : message;

  return {
    ...plainMessage,
    createdAt:
      plainMessage.createdAt instanceof Date
        ? plainMessage.createdAt.getTime()
        : plainMessage.createdAt,
    updatedAt:
      plainMessage.updatedAt instanceof Date
        ? plainMessage.updatedAt.getTime()
        : plainMessage.updatedAt,
    isMine: plainMessage.senderRole === role,
    seenByRecipient:
      plainMessage.senderRole === "user"
        ? plainMessage.readByDoctor
        : plainMessage.readByUser,
  };
};

const normalizeCounterpart = (appointment, role) => {
  if (role === "user") {
    return {
      id: appointment.docId,
      role: "doctor",
      name: appointment.docData.name,
      image: appointment.docData.image,
      subtitle: appointment.docData.speciality,
    };
  }

  return {
    id: appointment.userId,
    role: "user",
    name: appointment.userData.name,
    image: appointment.userData.image,
    subtitle: "Patient",
  };
};

const getAuthorizedAppointment = async (req, appointmentId) => {
  const participant = getParticipantFromRequest(req);
  const appointment = await appointmentModel.findById(appointmentId);

  if (!appointment) {
    return { error: "Appointment not found" };
  }

  if (
    (participant.role === "user" && appointment.userId !== participant.id) ||
    (participant.role === "doctor" && appointment.docId !== participant.id)
  ) {
    return { error: "Unauthorized appointment access" };
  }

  return { appointment };
};

const listChatThreads = async (req, res) => {
  try {
    const participant = getParticipantFromRequest(req);
    const appointmentFilter =
      participant.role === "user"
        ? { userId: participant.id }
        : { docId: participant.id };

    const appointments = await appointmentModel.find(appointmentFilter).sort({ date: -1 });
    const appointmentIds = appointments.map((appointment) => String(appointment._id));

    const messages = appointmentIds.length
      ? await chatMessageModel
          .find({ appointmentId: { $in: appointmentIds } })
          .sort({ createdAt: -1 })
      : [];

    const latestMessageByAppointment = new Map();
    const unreadCountByAppointment = new Map();

    messages.forEach((message) => {
      const appointmentId = String(message.appointmentId);

      if (!latestMessageByAppointment.has(appointmentId)) {
        latestMessageByAppointment.set(appointmentId, message);
      }

      const isUnread =
        participant.role === "user"
          ? message.senderRole === "doctor" && !message.readByUser
          : message.senderRole === "user" && !message.readByDoctor;

      if (isUnread) {
        unreadCountByAppointment.set(
          appointmentId,
          (unreadCountByAppointment.get(appointmentId) || 0) + 1
        );
      }
    });

    const threads = appointments.map((appointment) => {
      const normalizedAppointment = normalizeAppointmentRecord(req, appointment);
      const appointmentId = String(appointment._id);
      const latestMessage = latestMessageByAppointment.get(appointmentId);

      return {
        appointmentId,
        appointment: normalizedAppointment,
        counterpart: normalizeCounterpart(normalizedAppointment, participant.role),
        unreadCount: unreadCountByAppointment.get(appointmentId) || 0,
        canChat: !appointment.cancelled,
        lastActivity: latestMessage?.createdAt
          ? new Date(latestMessage.createdAt).getTime()
          : appointment.date,
        lastMessage: latestMessage
          ? normalizeChatMessage(latestMessage, participant.role)
          : null,
      };
    });

    res.json({ success: true, threads });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const participant = getParticipantFromRequest(req);
    const { appointmentId } = req.params;
    const { appointment, error } = await getAuthorizedAppointment(req, appointmentId);

    if (error) {
      return res.status(403).json({ success: false, message: error });
    }

    const normalizedAppointment = normalizeAppointmentRecord(req, appointment);
    const messages = await chatMessageModel
      .find({ appointmentId: String(appointmentId) })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      appointment: normalizedAppointment,
      counterpart: normalizeCounterpart(normalizedAppointment, participant.role),
      canChat: !appointment.cancelled,
      messages: messages.map((message) => normalizeChatMessage(message, participant.role)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const participant = getParticipantFromRequest(req);
    const { appointmentId } = req.params;
    const { text = "" } = req.body;
    const cleanText = text.trim();

    if (!cleanText) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const { appointment, error } = await getAuthorizedAppointment(req, appointmentId);

    if (error) {
      return res.status(403).json({ success: false, message: error });
    }

    if (appointment.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Chat is unavailable for cancelled appointments",
      });
    }

    const newMessage = await chatMessageModel.create({
      appointmentId: String(appointmentId),
      userId: appointment.userId,
      docId: appointment.docId,
      senderRole: participant.role,
      senderId: participant.id,
      text: cleanText,
      readByUser: participant.role === "user",
      readByDoctor: participant.role === "doctor",
    });

    const normalizedForUser = normalizeChatMessage(newMessage, "user");
    const normalizedForDoctor = normalizeChatMessage(newMessage, "doctor");

    emitToParticipant("user", appointment.userId, "chat:message:new", {
      appointmentId: String(appointmentId),
      message: normalizedForUser,
    });
    emitToParticipant("doctor", appointment.docId, "chat:message:new", {
      appointmentId: String(appointmentId),
      message: normalizedForDoctor,
    });

    const isUserSender = participant.role === "user";
    const senderName = isUserSender
      ? appointment.userData.name
      : appointment.docData.name;
    const recipientRole = isUserSender ? "doctor" : "user";
    const recipientId = isUserSender ? appointment.docId : appointment.userId;

    const responseMessage = normalizeChatMessage(newMessage, participant.role);

    res.json({
      success: true,
      message: responseMessage,
    });

    createNotification({
      recipientRole,
      recipientId,
      appointmentId: String(appointmentId),
      type: "chat-message",
      title: isUserSender
        ? `New patient message from ${senderName}`
        : `New doctor reply from ${senderName}`,
      message: `${senderName} sent a message for the appointment on ${formatSlotLabel(
        appointment.slotDate,
        appointment.slotTime
      )}.`,
      meta: {
        senderRole: participant.role,
        senderName,
      },
    }).catch((notificationError) => {
      console.log("Chat notification error:", notificationError.message);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const markChatThreadRead = async (req, res) => {
  try {
    const participant = getParticipantFromRequest(req);
    const { appointmentId } = req.params;
    const { appointment, error } = await getAuthorizedAppointment(req, appointmentId);

    if (error) {
      return res.status(403).json({ success: false, message: error });
    }

    const update =
      participant.role === "user"
        ? { readByUser: true }
        : { readByDoctor: true };

    const unreadFilter =
      participant.role === "user"
        ? {
            appointmentId: String(appointmentId),
            senderRole: "doctor",
            readByUser: false,
          }
        : {
            appointmentId: String(appointmentId),
            senderRole: "user",
            readByDoctor: false,
          };

    const updateResult = await chatMessageModel.updateMany(unreadFilter, { $set: update });

    if (updateResult.modifiedCount > 0) {
      const payload = {
        appointmentId: String(appointmentId),
        readerRole: participant.role,
      };

      emitToParticipant("user", appointment.userId, "chat:read", payload);
      emitToParticipant("doctor", appointment.docId, "chat:read", payload);

      markNotificationsAsRead({
        recipientRole: participant.role,
        recipientId: participant.id,
        appointmentId: String(appointmentId),
        type: "chat-message",
      }).catch((notificationError) => {
        console.log("Chat read notification error:", notificationError.message);
      });
    }

    res.json({ success: true, message: "Chat marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getChatMessages, listChatThreads, markChatThreadRead, sendChatMessage };
