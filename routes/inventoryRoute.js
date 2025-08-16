const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

//management  view restricted
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildManagementView)
);

router.get("/trigger-error", (req, res, next) => {
  throw new Error("Intentional server error for testing purposes.");
});

// Add classification (restricted)
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployee,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// JSON (restricted - management)
router.get(
  "/getInventory/:classification_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.getInventoryJSON)
);


/* ***********************
 * Route to Edit Inventory
 *************************/
// Edit (restricted)
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.editInventoryView)
);
// Update (restricted)
router.post(
  "/update-inventory",
  utilities.checkLogin,
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete (restricted)
router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.confirmDelete)
);
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.deleteInventory)
);
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddInventory)
);
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);



// router.get("/test-add", async (req, res) => {
//   try {
//     const testData = {
//       classification_id: 9,
//       inv_make: "Test",
//       inv_model: "Bike",
//       inv_year: 2023,
//       inv_description: "Test bicycle",
//       inv_image: "/images/vehicles/no-image.png",
//       inv_thumbnail: "/images/vehicles/no-image-tn.png",
//       inv_price: 999,
//       inv_miles: 0,
//       inv_color: "Red"
//     };

//     const result = await invModel.addInventory(
//       testData.classification_id,
//       testData.inv_make,
//       testData.inv_model,
//       testData.inv_year,
//       testData.inv_description,
//       testData.inv_image,
//       testData.inv_thumbnail,
//       testData.inv_price,
//       testData.inv_miles,
//       testData.inv_color
//     );

//     res.send(result ? "Success!" : "Failed");
//   } catch (error) {
//     console.error("Test error:", error);
//     res.status(500).send("Test failed");
//   }
// });

module.exports = router;