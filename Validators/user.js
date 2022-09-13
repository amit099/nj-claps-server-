const joi = require("joi");


const updateInteraestValidator = joi.object({
    _id: joi.string().required().messages({
        "any.required": "User Id required",
        "string.base": "Invalid User Id",
        "string.empty": "User Id Empty",
      }),
    interests: joi.array().min(1).items(
        joi.object({
            mainType: joi.string().required().messages({
                "any.required": "Main Type Missing",
                "string.base": "Invalid Main Type",
                "string.empty": "Main Type Empty"
            }),
            subType: joi.array().min(1).items(
                joi.string().required()
                    .messages({
                    "any.required": "Sub Type Missing",
                })
            )
        }).unknown(true).required().messages({
            "any.required": "Invalid Interest Item"
        })
    ).required()
    .messages({
        "any.required": "Interests Missing",
        "array.min": "Intersets List Empty",
    })
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})

const updateUserValidator = joi.object({
    _id: joi.string().required().messages({
        "any.required": "User Id required",
        "string.base": "Invalid User Id",
        "string.empty": "User Id Empty",
      }),
    fullName: joi.string().required().messages({
        "any.required": "Full Name Required",
        "string.base": "Invalid Full Name",
        "string.empty": "Full Name Empty"
    }),
    address: joi.string().required().messages({
        "any.required": "Address Required",
        "string.base": "Invalid Address Value",
        "string.empty": "Address Empty"
    }),
    bio: joi.string().empty("").messages({
        "string.base": "Invalid Bio Information",
    })
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})
const loginValidator = joi.object({
    email: joi.string().email().required().messages({
        "any.required": "Email Required",
        "string.base": "Invalid Email",
        "string.email": "Invalid Email",
        "string.empty": "Invalid Email"
    }),
    password: joi.string().min(8).required().messages({
        "any.required": "Password Required",
        "string.empty": "Invalid Password",        
        "string.min": "Password, Minimum Length (8)",
        "string.base": "Password Is String Type Attribute"
    }),
}).unknown(true).required().messages({
    "any.required": "Invalid Inputsdsdsds"
})

const addSocialUserValidator = joi.object({
    socials: joi.object({
        accountId: joi.string().required().messages({
            "any.required": "Social Account Id Required",
            "string.base": "Invalid Account Id",
            "string.empty": 'Account Id Empty'
        }),
        payload: joi.object({

        }).unknown(true).allow(null)
    }).unknown( true ).required().messages({
        "any.required": "Invalid Social Detail"
    }),
    fullName: joi.string().required().messages({
        "any.required": "Full Name Required",
        "string.base": "Invalid Full Name",
        "string.empty": "Full Name Empty"
    }),
    email: joi.string().email().required().messages({
        "any.required": "Email Required",
        "string.base": "Invalid Email",
        "string.empty": "Email Empty",
        "string.email": "Invalid Email"
    }),
    phoneNumber: joi.string().required().messages({
        "any.required": "Phone Number Required",
        "string.base": "Invalid Phone Number",
        "string.empty": "Phone Number Empty"
    }),
    address: joi.string().required().messages({
        "any.required": "Address Required",
        "string.base": "Invalid Address Value",
        "string.empty": "Address Empty"
    }),
    // password: joi.string().required().messages({
    //     "any.required": "Password Required",
    //     "string.base": "Invalid Password",
    //     "string.empty": "Password Empty"
    // })
}).required()
    .unknown(true)
    .messages({
    "any.required": "Invalid Inputs"
})

const addUserValidator = joi.object({
    fullName: joi.string().required().messages({
        "any.required": "Full Name Required",
        "string.base": "Invalid Full Name",
        "string.empty": "Full Name Empty"
    }),
    email: joi.string().email().required().messages({
        "any.required": "Email Required",
        "string.base": "Invalid Email",
        "string.empty": "Email Empty",
        "string.email": "Invalid Email"
    }),
    phoneNumber: joi.string().required().messages({
        "any.required": "Phone Number Required",
        "string.base": "Invalid Phone Number",
        "string.empty": "Phone Number Empty"
    }),
    address: joi.string().required().messages({
        "any.required": "Address Required",
        "string.base": "Invalid Address Value",
        "string.empty": "Address Empty"
    }),
    password: joi.string().required().messages({
        "any.required": "Password Required",
        "string.base": "Invalid Password",
        "string.empty": "Password Empty"
    })
}).required()
    .unknown(true)
    .messages({
    "any.required": "Invalid Inputs"
})
module.exports = {
    addUserValidator,
    loginValidator,
    addSocialUserValidator,
    updateUserValidator,
    updateInteraestValidator
}