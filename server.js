/* ******************************************
 * Primary server.js file of the application.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const session = require("express-session")
const pool = require('./database')
const baseController = require("./controllers/baseController")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser");

/* ***********************
 * Express App Setup
 *************************/
const app = express()

/* ***********************
 * View Engine and Layout
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") 

/* ***********************
 * Middleware
 *************************/

// Serve static files
app.use(express.static("public"))


// Parse incoming form data
app.use(express.urlencoded({ extended: true }))

// Session Middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Flash Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(cookieParser());

app.use(utilities.checkJWTToken);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
/* ***********************
 * Routes
 *************************/

// Static Pages
app.use(static)

// Home Route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory Routes
app.use("/inv", inventoryRoute)

// Account Routes
app.use("/account", accountRoute)

/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res) => {
  let nav = await utilities.getNav()
  res.status(404).render("errors/error", {
    title: "404 - Page Not Found",
    message: "Sorry, the page you requested does not exist.",
    nav
  })
})

/* ***********************
 * Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message = err.status == 404
    ? err.message
    : 'Oh no! There was a crash. Maybe try a different route?'
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || 'localhost'

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})
