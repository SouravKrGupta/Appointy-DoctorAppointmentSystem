import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let ioInstance;

const participantRoom = (role, id) => `${role}:${id}`;

const emitToParticipant = (role, id, event, payload) => {
  if (!ioInstance || !role || !id) {
    return;
  }

  ioInstance.to(participantRoom(role, id)).emit(event, payload);
};

const emitAppointmentEvent = ({ userId, docId, payload }) => {
  emitToParticipant("user", userId, "appointment:updated", payload);
  emitToParticipant("doctor", docId, "appointment:updated", payload);
};

const initRealtime = (app, port, allowedOrigins = []) => {
  const httpServer = createServer(app);

  ioInstance = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const { role, token } = socket.handshake.auth || {};

      if (!role || !token || !["user", "doctor"].includes(role)) {
        return next(new Error("Unauthorized socket connection"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.auth = {
        role,
        id: decoded.id,
      };

      return next();
    } catch (error) {
      return next(new Error("Unauthorized socket connection"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const { role, id } = socket.data.auth;

    socket.join(participantRoom(role, id));
    socket.emit("socket:ready", { role, id });
  });

  httpServer.listen(port, () => console.log(`Server started on PORT:${port}`));
};

export { emitAppointmentEvent, emitToParticipant, initRealtime };
