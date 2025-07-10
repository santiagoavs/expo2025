import app from "./app.js";
import "./database.js"; 
import { config } from "./src/config.js";

function main() {
    app.listen(config.server.PORT, () => {
        console.log(`Servidor corriendo en puerto ${config.server.PORT}`);
    });
}

main();