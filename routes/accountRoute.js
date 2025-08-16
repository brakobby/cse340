// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const accountValidate = require("../utilities/account-validation");

// Login/Register
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);

// Logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Update view (must be logged in)
router.get(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
);

// Process account info update
router.post(
  "/update/info",
  utilities.checkLogin,
  accountValidate.accountUpdateRules(),
  accountValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Process password update
router.post(
  "/update/password",
  utilities.checkLogin,
  accountValidate.passwordUpdateRules(),
  accountValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword)
);


/* ***********************
 * Export the Router
 *************************/
module.exports = router
