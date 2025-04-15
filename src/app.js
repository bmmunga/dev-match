const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");
const { connectRedis } = require("./config/tokenStore");

const app = express();

app.use(express.json());
app.use(cookieParser());

const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");

app.use("/auth", authRouter);
app.use("/profile", profileRouter);

Promise.all([connectDB(), connectRedis()])
  .then(() => {
    console.log("Database connected successfully");
    console.log("Redis connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Error during startup: ${err.message}`);
  });
