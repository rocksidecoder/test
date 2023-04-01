const Joi = require("joi");
const { errorMessages } = require("../utils/helper");

const signupValidation = {
  body: Joi.object({
    username: Joi.string()
      .required()
      .min(5)
      .max(10)
      .trim()
      .messages(errorMessages("Username")),
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .trim()
      .messages(errorMessages("Email Address")),
    password: Joi.string()
      .required()
      .regex(/[a-zA-Z0-9@#$&*]{5,15}/)
      .trim()
      .messages(errorMessages("Password"))
  })
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .min(10)
      .max(40)
      .trim()
      .messages(errorMessages("Email Address")),

    password: Joi.string().required().trim().messages(errorMessages("Password"))
  })
};

module.exports = {
  signupValidation,
  loginValidation
};
