const express = require("express");

const app = express();

PORT = 3000;

app.use("/test", (req, res) => {
  res.send("Hello from the server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
