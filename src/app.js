const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database");
const { User } = require("./models/user");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(400).send("User creation failed:", err.message);
  }
});

app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("An error occured");
  }
});

app.get("/feed", async (req, res) => {
  try {
    userFeed = await User.find({});
    if (!userFeed) {
      res.send(404).send("No users found");
    }
    res.send(userFeed);
  } catch (err) {
    res.status(400).send("An error occured");
  }
});

app.get("/user/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const userById = await User.findById(id);
    if (!userById) {
      res.status(404).send("User not found");
    }
    res.send(userById);
  } catch (err) {
    res.status(400).send("An error occured");
  }
});

app.delete("/user/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const userToDelete = await User.findByIdAndDelete(id);
    if (!userToDelete) {
      res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("An error occured");
  }
});

app.patch("/user/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = [
      "imageUrl",
      "about",
      "skills",
      "gender",
      "password",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 8) {
      throw new Error("Skills cannot exceed 8");
    }
    const userToUpdate = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!userToUpdate) {
      res.status(404).send("User not found");
      return;
    }
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

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
