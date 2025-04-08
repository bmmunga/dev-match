const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database");
const { User } = require("./models/user");
const { validateSignupData } = require("./utils/validations");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json("Invalid signup information");
    }
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(400).send(`User creation failed: ${err.message}`);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return res.status(200).send("Login successful");
    } else {
      return res.status(401).send("Invalid email or password");
    }
  } catch (err) {
    res.send(400).send("ERROR: " + err.message);
  }
});

app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      return res.status(404).send("User not found");
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
