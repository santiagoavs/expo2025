import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet'; 

// Rutas 
import loginEmployeesRoutes from "./src/routes/loginEmployees.routes.js";
import registerEmployeesRoutes from "./src/routes/registerEmployees.routes.js";
import employeesRoutes from "./src/routes/employees.routes.js";

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: "http://localhost:5173",
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

// Rutas principales
app.use("/api/employees", employeesRoutes);            // GET, PUT, DELETE, PATCH
app.use("/api/employees", registerEmployeesRoutes);    // POST de registro
app.use("/api/auth", loginEmployeesRoutes);            // login + logout

// Ruta de prueba
app.get("/ping", (req, res) => res.send("pong"));

export default app;
