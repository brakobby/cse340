const utilities = require(".");
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator");
const validate = {};

/* ***********************************************************
 * Registration Data Validation Rule
 * ********************************************************* */

validate.registrationRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Please provide a first name."),

        //lastname is required and must be a string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 2})
        .withMessage("Please provide a last name. "),

        //valid email is required and cannot already exist in the database
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
                throw new Error("Email exists. Please Login or use a different Email")
            }
        }),
        
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements.")

    ]
}
/* ***********************************************************
 * Login Data Validation Rule
 * ********************************************************* */
validate.loginRules = () => {
    return[
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
        
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements.")
    ]
}
 

/* ************************************************************************************************
 * check data and return errors or continue with to register
 * ********************************************************************************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }

    next()
}

/* ************************************************************************************************
 * check data and return errors or continue with to login
 * ********************************************************************************************** */
validate.checkLoginData = async(req, res, next) => {
    const {account_email, account_password } = req.body;
    let errors = [];
    errors = validationResult(req);
     if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors,
            title: "Registration",
            nav,
            account_email,
        })
        return
    }
}

module.exports = validate
