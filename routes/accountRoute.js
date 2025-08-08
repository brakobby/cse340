const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")

/* ***********************
 * Route to Login Page
 *************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData,utilities.handleErrors(accountController.accountLogin))


/* ***********************
 * Route to Register Page
 *************************/
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post('/register', regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));


/* ***********************
 * Route to Management Page
 *************************/
router.get("/", utilities.handleErrors(accountController.buildManagement));

/* ***********************
 * Export the Router
 *************************/
module.exports = router
