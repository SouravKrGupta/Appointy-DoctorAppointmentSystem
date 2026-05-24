import { listNotificationsForParticipant, markNotificationsAsRead } from "../utils/notifications.js";

const listNotifications = async (req, res) => {
  try {
    const participant = req.user;
    const data = await listNotificationsForParticipant({
      recipientRole: participant.role,
      recipientId: participant.id,
    });

    res.json({ success: true, ...data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const participant = req.user;
    const { notificationIds = [] } = req.body;
    const { unreadCount, deletedNotificationIds, deletedCount } =
      await markNotificationsAsRead({
      recipientRole: participant.role,
      recipientId: participant.id,
      notificationIds,
      });

    res.json({
      success: true,
      message: "Notifications removed",
      unreadCount,
      deletedNotificationIds,
      deletedCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listNotifications, markNotificationsRead };
