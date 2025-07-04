import jwt from "jsonwebtoken";
import { config } from "../src/config.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return res.status(401).json({ message: "No autorizado. Token faltante." });

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    req.user = decoded; // Incluye id, role, etc.
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};
