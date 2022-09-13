const joi = require("joi");

const idValidator = joi.object({
    _id: joi.string().required().messages({
        "any.required": "Id Required", 
        "string.base": "Invalid Id",
        "string.empty": "Invalid Id"
    })
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})

module.exports = {
    idValidator
}