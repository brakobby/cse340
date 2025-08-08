const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Validation middleware
const { body, validationResult } = require('express-validator');

/* ***********************
 * Deliver Login View
 *************************/
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: req.body.account_email || "",
    });
  } catch (error) {
    next(error);
  }
}

/* ***********************
 * Deliver Register View
 *************************/
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 * Process Registration with Validation
 * *************************************** */
const registerValidationRules = [
  body('account_firstname')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('account_lastname')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('account_email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('account_password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

async function registerAccount(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: errors.array(),
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email,
      });
    }

    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    
    // Check if email already exists
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount) {
      let nav = await utilities.getNav();
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: [{ msg: 'Email already in use' }],
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (!regResult) {
      throw new Error('Registration failed');
    }

    req.flash(
      "success",
      `Congratulations, ${account_firstname}! You're now registered. Please log in.`
    );
    return res.redirect("/account/login");
    
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 * Process Login
 * *************************************** */
const loginValidationRules = [
  body('account_email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
  body('account_password')
    .notEmpty().withMessage('Password is required'),
];

async function accountLogin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: errors.array(),
        account_email: req.body.account_email,
      });
    }

    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    if (!accountData) {
      req.flash("error", "Invalid credentials");
      return res.status(400).render("account/login", {
        title: "Login",
        nav: await utilities.getNav(),
        errors: null,
        account_email,
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("error", "Invalid credentials");
      return res.status(400).render("account/login", {
        title: "Login",
        nav: await utilities.getNav(),
        errors: null,
        account_email,
      });
    }

    // Create JWT token
    const tokenPayload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type || 'Client',
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    req.flash("success", `Welcome back, ${accountData.account_firstname}!`);
    return res.redirect("/account/");

  } catch (error) {
    next(error);
  }
}

/* ****************************************
 * Deliver Account Management View
 * *************************************** */
async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 * Logout Handler
 * *************************************** */
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt");
    req.flash("success", "You have been logged out successfully");
    res.redirect("/account/login");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerValidationRules,
  registerAccount,
  loginValidationRules,
  accountLogin,
  buildManagement,
  accountLogout,
};