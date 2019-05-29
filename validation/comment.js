const Validator = require('validator');
const isEmpty = require('./is-empty');

const validatePostCommentInput = (data) => {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';
    
    if (!Validator.isLength(data.text, { min: 10, max: 100 })) {
        errors.text = "Text field should be b/w 10 to 100 characters!"
    }

    if (Validator.isEmpty(data.text)) {
        errors.text = "Text field is required!"
    }
   
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validatePostCommentInput;