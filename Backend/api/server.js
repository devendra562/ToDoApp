const express = require("express");
require("dotenv").config();
const cors = require('cors');
const http = require('http');

// create express app
const app = express();
const server = http.createServer(app);

const socketIO = require("./utils/soket");
const io = socketIO.init(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const app_v1 = require("./modules/v1/route_manager");
app.use("/api/v1", app_v1);

// Setup server port
const port = process.env.PORT || 5000;

// listen for requests
try {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error("Failed to start server.", error);
}