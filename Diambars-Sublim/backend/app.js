import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet'; 
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Importación de rutas
import authRoutes from "./src/routes/auth.routes.js";
import employeesRoutes from "./src/routes/employees.routes.js";
import registerEmployeesRoutes from "./src/routes/registerEmployees.routes.js";
import userRoutes from "./src/routes/users.routes.js";
import registerUsersRoutes from "./src/routes/registerUsers.routes.js";
import verifyEmailRoutes from "./src/routes/verifyEmail.routes.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import { debugEmailValidation } from "./src/middlewares/debugEmailValidaton.js";
import productRoutes from "./src/routes/product.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Configuración de CORS
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  exposedHeaders: ["set-cookie"]
};
// Configuración de CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// Middleware de seguridad
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

app.use("/public", express.static(path.join(__dirname, "public")));
// Middleware para manejar archivos estáticos
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

//ruta de la API
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/employees/register", debugEmailValidation, registerEmployeesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/register", debugEmailValidation, registerUsersRoutes);
app.use("/api/verify-email", verifyEmailRoutes);
app.use("/api/password-recovery", passwordRecoveryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.get("/ping", (req, res) => res.send("pong"));
// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Ha ocurrido un error en el servidor",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

export default app;