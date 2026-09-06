import dotenv from "dotenv"
dotenv.config()

import server from "./src/app.js"
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
      console.log(`⚡️ SERVER RUNNING ON PORT ${PORT}`);
});