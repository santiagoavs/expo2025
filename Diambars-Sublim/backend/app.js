import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
    origin: "http://localhost:5173", // Reemplazar con la URL de el frontend que tendrremos en producción
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permitir envío de cookies y credenciales
  };
app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

export default app;