const joi = require("joi");


const addRolesValidator = joi.object({
    title: joi.string().required().messages({
        "any.required": "Title Required",
        "string.base": "Invalid Title",
        "string.empty": "Invalid Title"
    }),
    level:  joi.number().min(1).required().messages({
        "any.required": "Level Required",
        "number.base": "Invalid Level",
        "number.min": "Invalid Level"
    })
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})

const updateRolesValidator = joi.object({
    _id: joi.string().required().messages({
        "any.required": "Id Required",
        "string.base": "Invalid Id",
        "string.empty": "Invalid Id"
    }),
    title: joi.string().required().messages({
        "any.required": "Title Required",
        "string.base": "Invalid Title",
        "string.empty": "Invalid Title"
    }),
    level:  joi.number().min(1).required().messages({
        "any.required": "Level Required",
        "number.base": "Invalid Level",
        "number.min": "Invalid Level"
    })
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})


const addPredefineValidator = joi.object({
    title: joi.string().required().messages({
        "any.required": "Title Required",
        "string.base": "Invalid Title",
        "string.empty": "Invalid Title"
    }),
    payload: joi.object({

    }).unknown(true).allow(null)
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
}) 

const updatePredefineValidator = joi.object({
    _id: joi.string().required().messages({
        "any.required": "Id Required",
        "string.base": "Invalid Id",
        "string.empty": "Invalid Id"
    }),
    title: joi.string().empty("").messages({
        "any.required": "Title Required",
        "string.base": "Invalid Title",
    }),
    payload: joi.object({

    }).unknown(true).allow(null)
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})

const listPredefineValidator = joi.object({
    limit: joi.number().required().min(0).messages({
        "any.required": "Invalid Limit",
        "number.min": "Invalid Limit Value",
        "number.base": "Invalid Limit Value"
    }),
    offset: joi.number().required().min(0).messages({
        "any.required": "Invalid Offset",
        "number.min": "Invalid Offset Value",
        "number.base": "Invalid Offset Value"
    }),
    user: joi.string().empty("").optional().messages({
        "string.base": "Invalid User Id"
    })
}).unknown(true).required().messages({
    "any.required": "Invalid Inputs"
})

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
    addPredefineValidator,
    updatePredefineValidator,
    listPredefineValidator,
    idValidator,
    addRolesValidator,
    updateRolesValidator
}

