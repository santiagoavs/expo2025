import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet'; 

// Importar todas las rutas disponibles
import authRoutes from "./src/routes/auth.routes.js";
import employeesRoutes from "./src/routes/employees.routes.js";
import registerEmployeesRoutes from "./src/routes/registerEmployees.routes.js";
import userRoutes from "./src/routes/users.routes.js";
import registerUsersRoutes from "./src/routes/registerUsers.routes.js";
import verifyEmailRoutes from "./src/routes/verifyEmail.routes.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.routes.js";
import { debugEmailValidation } from "./src/middlewares/debugEmailValidaton.js";

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"], // Incluir frontend público y privado
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Middlewares base
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// Rutas de autenticación unificada (reemplaza las rutas separadas de login)
app.use("/api/auth", authRoutes);            // Maneja login y logout unificados

// Rutas de empleados
app.use("/api/employees", employeesRoutes);            // GET, PUT, DELETE, PATCH
app.use("/api/employees/register", debugEmailValidation, registerEmployeesRoutes); // Ruta de registro protegida

// Rutas de usuarios (clientes)
app.use("/api/users", userRoutes);            // GET, PUT, DELETE, PATCH
app.use("/api/users/register", debugEmailValidation, registerUsersRoutes);   // Registro público de usuarios

// Ruta para verificación de correo electrónico
app.use("/api/verify-email", verifyEmailRoutes); // Verificación de correo electrónico

// Ruta para recuperación de contraseña
app.use("/api/password-recovery", passwordRecoveryRoutes); // Recuperación de contraseña

// Ruta de prueba
app.get("/ping", (req, res) => res.send("pong"));

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Ha ocurrido un error en el servidor",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

export default app;