const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateRegisterInput = (data)=>{
    let errors={};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';


    if(!Validator.isLength(data.name,{min:3,max:25})){
        errors.name = "Name should be b/w 3 to 25 characters!"
    }

    if(Validator.isEmpty(data.name)){
        errors.name = "Name field is required and can not be blank!"
    }

    if(!Validator.isEmail(data.email)){
        errors.email = "Not a valid email!"
    }

    if(Validator.isEmpty(data.email)){
        errors.email = "Email field is required and can not be blank!"
    }

    if(!Validator.isLength(data.password, {min:6,max:30})){
        errors.password = "Password field should be atleast of 6 characters!"
    }
    
    if(Validator.isEmpty(data.password)){
        errors.password = "Password field is required and can not be blank!"
    }

    if(Validator.isEmpty(data.password2)){
        errors.password2 = "Password2 field is required and can not be blank!"
    }

    if(!Validator.equals(data.password,data.password2)){
        errors.password2 = "Passwords must match!"
    }
    // if(Validator.isAlphanumeric)
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateRegisterInput;