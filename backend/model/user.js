const mongoose = require("mongoose");
const bcryptPassword = require("bcrypt");
const { salt } = require("../config");
const APIError = require("../utils/APIError");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    allowNull: false
  },
  email: {
    type: String,
    unique: true,
    allowNull: false
  },
  password: String
});

// check email and username already exists or not
userSchema.pre("save", async function (next) {
  const existsData = await mongoose.models["User"].find(
    {
      $or: [{ email: this.email }, { username: this.username }]
    },
    "email username"
  );

  if (existsData.length)
    return next(
      new APIError({
        status: 409,
        message: existsData.email
          ? "Email already exists !!"
          : "Username already exists !!"
      })
    );
  return next();
});

// hash the paasword
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptPassword.hash(this.password, parseInt(salt));
  next();
});

// Check the password
userSchema.methods.isValidPassword = async function (password) {
  return await bcryptPassword.compare(password, this.password);
};
module.exports = mongoose.model("User", userSchema, "user");
