const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const https = require("https");
const http = require("http"); // Import HTTP module
const dataRoutes = require("./routes/dataRoutes");
const app = express();


const HTTPS_PORT = 5503; // HTTPS server port

// SSL options for HTTPS
const sslOptions = {
  key: fs.readFileSync(path.resolve("C:/Utils/Certificates/STAR_yjktechnologies_com", "STAR.yjktechnologies.com_key.txt")),
  cert: fs.readFileSync(path.resolve("C:/Utils/Certificates/STAR_yjktechnologies_com", "STAR_yjktechnologies_com.crt")),
  ca: fs.readFileSync(path.resolve("C:/Utils/Certificates/STAR_yjktechnologies_com", "STAR_yjktechnologies_com.ca-bundle")),
};

app.use(cors());
app.use(express.json({limit:'10mb'}));

// Middleware
app.use("/", dataRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the home page!");
});

// Create HTTP server
// Create HTTPS server
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on https://localhost:${HTTPS_PORT}`);
  });




