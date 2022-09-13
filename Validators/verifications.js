const joi = require("joi");
const { EMAIL,
    PHONENUMBER,
    CODE,
    LINK,
    FORGOTPASSWORD,
    AVAILIBILITY,
    VERIFICATION,
    USER
} = require("../Controllers/constVariables");

const validateLinkValidator = joi.object({
    verificationType: joi.string().required().valid(EMAIL, PHONENUMBER)
        .messages({
            "any.required": "Verification Type Required",
            "string.base": "Invalid Verification Type",
            "string.empty": "Verification Type Empty",

        }),
    verificationOn:
        joi.when("verificationType", {
            switch: [
                {
                    is: PHONENUMBER,
                    then: joi.string().required().messages({
                        "string.empty": `Phone Number can't be Empty`,
                        "any.required": `Phone Number is Required`,
                        "string.base": "Invalid Phone Number"
                    }),
                },
                {
                    is: EMAIL,
                    then: joi.string().email().required().messages({
                        "string.empty": `Email can't be Empty`,
                        "any.required": `Email is Required`,
                        "string.base": "Invalid Email",
                        "string.email": "Invalid Email"
                    }),
                }
            ]
        }),
        personType: joi.string().required().valid("USER")
        .messages({
            "any.required": "Person Type Required",
            "string.base": "Invalid Person Type",
            "string.empty": "Person Type Empty",
            "any.only": "Person Type Can be [User]"
        }),
}).required()
.unknown(true)
.messages({
"any.required": "Invalid Inputs"
})


const sendVerificationOtp = joi.object({
   
    verificationMethod: joi.string().valid( CODE, LINK ).required().messages({
        "any.required": "Verification Method",
        "any.only": "Verification Method Can be [CODE, LINK]",
        "string.base": 'Invalid Verfication Method',
        "string.empty": 'Verfication Method Empty'
    }),
    verificationType: joi.string().required().valid(EMAIL, PHONENUMBER)
        .messages({
            "any.required": "Verification Type Required",
            "string.base": "Invalid Verification Type",
            "string.empty": "Verification Type Empty",

        }),
    verificationOn:
        joi.when("verificationType", {
            switch: [
                {
                    is: PHONENUMBER,
                    then: joi.string().required().messages({
                        "string.empty": `Phone Number can't be Empty`,
                        "any.required": `Phone Number is Required`,
                        "string.base": "Invalid Phone Number"
                    }),
                },
                {
                    is: EMAIL,
                    then: joi.string().email().required().messages({
                        "string.empty": `Email can't be Empty`,
                        "any.required": `Email is Required`,
                        "string.base": "Invalid Email",
                        "string.email": "Invalid Email"
                    }),
                }
            ]
        } ),
    personType: joi.string().required().valid("USER")
    .messages({
        "any.required": "Person Type Required",
        "string.base": "Invalid Person Type",
        "string.empty": "Person Type Empty",
        "any.only": "Person Type Can be [User]"
    }),
    purpose: joi.string().valid( FORGOTPASSWORD, VERIFICATION, AVAILIBILITY ).required().messages({
        "any.rquired": "Otp PurPose Required",
        "string.base": "Invalid Otp Purpose",
        "string.empty": "Empty Invalid Otp",
        "any.only": `Otp Purpose Can be [ ${FORGOTPASSWORD, VERIFICATION, AVAILIBILITY} ]`
    })
}).required()
    .unknown(true)
    .messages({
    "any.required": "Invalid Inputs"
    })

    const validateCodeValidator = joi.object({
        verificationMethod :  joi.string().required().valid( CODE, LINK ).messages({
            "any.required": "Invalid Varification Method",
            "string.base": "Invalid Varification Method",
            "any.only": "Varification Method, can be [ CODE, LINK ]"
        }),
        verificationType: joi.string().valid( EMAIL, PHONENUMBER ).required().messages({
            "any.required": "Invalid Varification Type",
            "string.base": "Invalid Varification Type",
            "any.only": "Varification Type, can be [ Email, Phone Number ]"
        }),
        code: joi.string().required().messages({
            "any.required": "Invalid Varification Code",
            "string.base": "Invalid Varification Code",
            "string.empty": "Code can't be Empty"
        }),
        verificationOn:
        joi.when("verificationType", {
            switch: [
                {
                    is: PHONENUMBER,
                    then: joi.string().required().messages({
                        "string.empty": `Phone Number can't be Empty`,
                        "any.required": `Phone Number is Required`,
                        "string.base": "Invalid Phone Number"
                    }),
                },
                {
                    is: EMAIL,
                    then: joi.string().email().required().messages({
                        "string.empty": `Email can't be Empty`,
                        "any.required": `Email is Required`,
                        "string.base": "Invalid Email",
                        "string.email": "Invalid Email"
                    }),
                }
            ]
        } ),
         personType: joi.string().required().valid( USER ).messages({
            "any.required": "Invalid Person Type",
            "string.base": "Invalid Person Type",
            "any.only": "Person Type, can be [ USER ]"
        }),
    }).unknown(true).required().messages({
        "any.required": "Invalid Inputs"
    })

module.exports = {
    sendVerificationOtp,
    validateCodeValidator,
    validateLinkValidator
}