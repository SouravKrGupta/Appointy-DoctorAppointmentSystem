import notificationModel from "../models/notificationModel.js";
import { emitToParticipant } from "./socket.js";

const toPlainObject = (value) =>
  typeof value?.toObject === "function" ? value.toObject() : value;

const buildActionLink = ({ recipientRole, type, appointmentId }) => {
  if (!appointmentId) {
    return recipientRole === "doctor" ? "/doctor-dashboard" : "/my-appointments";
  }

  if (type === "chat-message") {
    return recipientRole === "doctor"
      ? `/doctor-chats?appointment=${appointmentId}`
      : `/my-chats?appointment=${appointmentId}`;
  }

  if (recipientRole === "doctor") {
    return `/doctor-appointments?appointment=${appointmentId}`;
  }

  if (recipientRole === "admin") {
    return "/all-appointments";
  }

  return "/my-appointments";
};

const formatNotificationRecord = (notification) => {
  const plainNotification = toPlainObject(notification);

  return {
    ...plainNotification,
    actionLink: buildActionLink({
      recipientRole: plainNotification.recipientRole,
      type: plainNotification.type,
      appointmentId: plainNotification.appointmentId,
    }),
    createdAt:
      plainNotification.createdAt instanceof Date
        ? plainNotification.createdAt.getTime()
        : plainNotification.createdAt,
    updatedAt:
      plainNotification.updatedAt instanceof Date
        ? plainNotification.updatedAt.getTime()
        : plainNotification.updatedAt,
  };
};

const createNotification = async ({
  recipientRole,
  recipientId,
  appointmentId = "",
  type,
  title,
  message,
  meta = {},
}) => {
  const notification = await notificationModel.create({
    recipientRole,
    recipientId: String(recipientId),
    appointmentId: appointmentId ? String(appointmentId) : "",
    type,
    title,
    message,
    actionLink: buildActionLink({
      recipientRole,
      type,
      appointmentId: appointmentId ? String(appointmentId) : "",
    }),
    meta,
  });

  emitToParticipant(
    recipientRole,
    String(recipientId),
    "notification:new",
    formatNotificationRecord(notification)
  );

  return notification;
};

const listNotificationsForParticipant = async ({
  recipientRole,
  recipientId,
  limit = 20,
}) => {
  const filter = {
    recipientRole,
    recipientId: String(recipientId),
    isRead: false,
  };

  await notificationModel.deleteMany({
    recipientRole,
    recipientId: String(recipientId),
    isRead: true,
  });

  const notifications = await notificationModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  const unreadCount = await notificationModel.countDocuments({
    ...filter,
    isRead: false,
  });

  return {
    notifications: notifications.map(formatNotificationRecord),
    unreadCount,
  };
};

const markNotificationsAsRead = async ({
  recipientRole,
  recipientId,
  notificationIds = [],
  appointmentId = "",
  type = "",
}) => {
  const filter = {
    recipientRole,
    recipientId: String(recipientId),
    isRead: false,
  };

  if (notificationIds.length) {
    filter._id = { $in: notificationIds };
  }

  if (appointmentId) {
    filter.appointmentId = String(appointmentId);
  }

  if (type) {
    filter.type = type;
  }

  const notificationsToDelete = await notificationModel.find(filter).select("_id");
  const deletedNotificationIds = notificationsToDelete.map((notification) =>
    String(notification._id)
  );

  if (deletedNotificationIds.length) {
    await notificationModel.deleteMany({
      _id: { $in: deletedNotificationIds },
      recipientRole,
      recipientId: String(recipientId),
    });
  }

  const unreadCount = await notificationModel.countDocuments({
    recipientRole,
    recipientId: String(recipientId),
    isRead: false,
  });

  emitToParticipant(
    recipientRole,
    String(recipientId),
    "notification:read",
    { unreadCount, deletedNotificationIds }
  );

  return {
    unreadCount,
    deletedNotificationIds,
    deletedCount: deletedNotificationIds.length,
  };
};

export {
  createNotification,
  formatNotificationRecord,
  listNotificationsForParticipant,
  markNotificationsAsRead,
};
