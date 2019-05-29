const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateProfileInput = (data) => {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    // handle validation
    if (!Validator.isLength(data.handle, { min: 2, max: 75 })) {
        errors.handle = "Handle must be between 2 to 75 characters!"
    }

    if (Validator.isEmpty(data.handle)) {
        errors.handle = "Handle field is required!"
    }

    // website validation
    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website)) {
            errors.website = "Not a valid Url!"
        }
    }

    // socials validation
    if (!isEmpty(data.youtube)) {
        if (!Validator.isURL(data.youtube)) {
            errors.youtube = "Not a valid Url!"
        }
    }
    if (!isEmpty(data.twitter)) {
        if (!Validator.isURL(data.twitter)) {
            errors.twitter = "Not a valid Url!"
        }
    }
    if (!isEmpty(data.facebook)) {
        if (!Validator.isURL(data.facebook)) {
            errors.facebook = "Not a valid Url!"
        }
    }
    if (!isEmpty(data.instagram)) {
        if (!Validator.isURL(data.instagram)) {
            errors.instagram = "Not a valid Url!"
        }
    }
    if (!isEmpty(data.linkedin)) {
        if (!Validator.isURL(data.linkedin)) {
            errors.linkedin = "Not a valid Url!"
        }
    }

    // status validation
    if (Validator.isEmpty(data.status)) {
        errors.status = "Status field is required!"
    }

    // skills validation
    if (Validator.isEmpty(data.skills)) {
        errors.skills = "Skills field is required!"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateProfileInput;