const validator = require("validator");

const validateSignupData = (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json("First name or last name are required");
  } else if (!validator.isEmail(emailId)) {
    return res.status(400).json("A valid email is required");
  } else if (!validator.isStrongPassword(password)) {
    return res
      .status(400)
      .json("Password must contain letters, numbers, and symbols");
  }
};

const validateProfileEditData = (req) => {
  const allowedEdits = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "imageUrl",
    "about",
    "skills",
  ];
  const isEditAllowed = Object.keys(req.body).every((key) =>
    allowedEdits.includes(key)
  );
  return isEditAllowed;
};

module.exports = { validateSignupData, validateProfileEditData };
