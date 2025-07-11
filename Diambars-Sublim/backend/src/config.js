import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    URI: process.env.DB_URI,
  },
  server: {
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`
  },
  superadmin: {
    EMAIL: process.env.SUPERADMIN_EMAIL,
    PASSWORD: process.env.SUPERADMIN_PASSWORD,
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || `Diambars <${process.env.EMAIL_USER}>`
  },
  JWT: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES,
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};