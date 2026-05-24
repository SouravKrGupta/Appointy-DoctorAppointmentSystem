import mongoose from "mongoose";

const getMongoUri = () => {
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!rawUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URI or MONGO_URI in backend/.env."
    );
  }

  const uri = rawUri.trim();

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      'Invalid MongoDB connection string. It must start with "mongodb://" or "mongodb+srv://".'
    );
  }

  const [base, query] = uri.split("?");
  const withoutProtocol = base.replace(/^mongodb(\+srv)?:\/\//, "");
  const firstPathSlashIndex = withoutProtocol.indexOf("/");
  const path =
    firstPathSlashIndex === -1 ? "" : withoutProtocol.slice(firstPathSlashIndex + 1);
  const hasDatabaseName = path.length > 0;

  if (hasDatabaseName) {
    return uri;
  }

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const uriWithDatabase = `${normalizedBase}/appointy`;
  return query ? `${uriWithDatabase}?${query}` : uriWithDatabase;
};

const connectDB = async () => {
  try {
    await mongoose.connect(getMongoUri());
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
