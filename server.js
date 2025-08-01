/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/");
app.use(express.static("public"));

/* ***********************
 * View engine and Templates
 *  ************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
//Inventory Routes
app.use("/inv", inventoryRoute)
 
app.use(async (req, res) => {
  let nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "404 - Page Not Found",
    message: "Sorry, the page you requested does not exist.",
    nav
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 *Express Error Handler
 *Place after all other middleware
 * ********************** */
app.use(async(err,req,res,next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if(err.status==404){
    message = err.message;
  }else{
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

