const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database");

const app = express();

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
  });
