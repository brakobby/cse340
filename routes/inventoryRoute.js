const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController")
const utilities = require("../utilities");

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

router.get("/trigger-error", (req, res, next) => {
  throw new Error("Intentional server error for testing purposes.");
});


module.exports = router;