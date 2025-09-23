import app from "./app.js";
import "./database.js"; 
import { config } from "./src/config.js";

function main() {
    app.listen(config.server.PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en puerto ${config.server.PORT}`);
        console.log(`Disponible en: http://localhost:${config.server.PORT}`);
        console.log(`Disponible en red: http://[TU-IP]:${config.server.PORT}`);
    });
}

main();