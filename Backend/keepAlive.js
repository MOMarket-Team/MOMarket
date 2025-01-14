const https = require("https");

require("dotenv").config();

const serverUrl = process.env.SERVER_URL || "http://localhost:4000";
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

function pingServer() {
  https
    .get(serverUrl, (resp) => {
      console.log(`Server pinged successfully at ${new Date()}`);
    })
    .on("error", (err) => {
      console.error("Error pinging server:", err.message);
    });
}

module.exports = {
  pingServer,
  PING_INTERVAL,
};
