const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateLoginInput = (data) => {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (!Validator.isEmail(data.email)) {
        errors.email = "Not a valid email!"
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email field is required and can not be blank!"
    }
    
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "Password field should be atleast of 6 characters!"
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required and can not be blank!"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateLoginInput;