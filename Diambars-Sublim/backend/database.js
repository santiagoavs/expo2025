import mongoose from "mongoose";
import { config } from "./src/config.js";
import { ensureSuperAdminExists } from "./src/utils/initSuperAdmin.js";

mongoose.connect(config.db.URI);

const connection = mongoose.connection;

connection.once("open", async () => {
    console.log("DB is connected");
    await ensureSuperAdminExists();
});

connection.on("disconnected", () => {
    console.log("DB is disconnected");
});

connection.on("error", (error) => {
    console.log("DB error is: " + error);
});