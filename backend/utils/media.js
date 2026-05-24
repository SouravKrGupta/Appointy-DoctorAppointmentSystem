const MEDIA_URL_PREFIX = "/media/";

const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

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

  if (/^(https?:\/\/|data:)/i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${getBaseUrl(req)}${imagePath}`;
  }

  return `${getBaseUrl(req)}/${imagePath}`;
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
