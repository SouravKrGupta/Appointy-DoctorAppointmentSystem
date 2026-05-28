const MEDIA_URL_PREFIX = "/media/";

const normalizeStoredPath = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/\\/g, "/").trim();

  if (/^(https?:\/\/|data:)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  const mediaPathIndex = normalizedPath.toLowerCase().indexOf("/media/");
  if (mediaPathIndex >= 0) {
    return normalizedPath.slice(mediaPathIndex);
  }

  if (normalizedPath.toLowerCase().startsWith("media/")) {
    return `/${normalizedPath}`;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
};

const getBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return `${req.protocol}://${req.get("host")}`;
};

const toPlainObject = (value) => {
  if (!value) {
    return value;
  }

  return typeof value.toObject === "function" ? value.toObject() : value;
};

const toPublicMediaUrl = (req, imagePath) => {
  if (!imagePath) {
    return imagePath;
  }

  const normalizedPath = normalizeStoredPath(imagePath);

  if (/^(https?:\/\/|data:)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  return `${getBaseUrl(req)}${normalizedPath}`;
};

const normalizeImageRecord = (req, record) => {
  const plainRecord = toPlainObject(record);

  if (!plainRecord) {
    return plainRecord;
  }

  return {
    ...plainRecord,
    image: toPublicMediaUrl(req, plainRecord.image),
  };
};

const normalizeAppointmentRecord = (req, appointment) => {
  const plainAppointment = toPlainObject(appointment);

  if (!plainAppointment) {
    return plainAppointment;
  }

  return {
    ...plainAppointment,
    userData: normalizeImageRecord(req, plainAppointment.userData),
    docData: normalizeImageRecord(req, plainAppointment.docData),
  };
};

const getStoredMediaPath = (filename) => `${MEDIA_URL_PREFIX}${filename}`;

export {
  getStoredMediaPath,
  normalizeAppointmentRecord,
  normalizeImageRecord,
  toPublicMediaUrl,
};
