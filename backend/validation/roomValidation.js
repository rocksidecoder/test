const Joi = require("joi");
const { errorMessages } = require("../utils/helper");

const checkRoomValidation = {
  params: Joi.object({
    roomId: Joi.string().required().trim().messages(errorMessages("Room id"))
  })
};

module.exports = {
  checkRoomValidation
};
