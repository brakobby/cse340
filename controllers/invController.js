const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* *************************************
 * build invention by classification view
 * *********************************** */

invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId;
        const data = await invModel.getInventoryByClassificationId(classification_id);
        
        if (!data || data.length === 0) {
            let nav = await utilities.getNav();
            res.render("./inventory/classification", {
                title: "No Vehicles Found",
                nav,
                grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>',
            });
            return;
        }

        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        const className = data[0].classification_name;
        
        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        });
    } catch (error) {
        next(error);
    }
}

/* ************************************
 * building the buildDetailView
 * ********************************** */
invCont.buildDetailView = async function (req, res, next){
    try{
        const invId = req.params.inv_id;
        const data = await invModel.getInventoryById(invId);
        const detail = await utilities.buildDetailHTML(data);
        const nav =await utilities.getNav();
        const title = `${data.inv_year} ${data.inv_make} ${data.inv_model}`;
        res.render("./inventory/detail", {
            title,
            nav, 
            detail
        });
    }catch(error){
        next(error);
    }
};

//  


invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null
    })
  } catch (error) {
    console.error("Error building management view:", error)
    next(error)
  }
}


invCont.buildEditInventoryView = async function (req, res, next) {
    try {
        const inv_id = req.params.inv_id; // get inventory ID from URL
        const nav = await utilities.getNav(); // build navigation
        const invData = await invModel.getInventoryById(inv_id); // fetch inventory data from DB
        const classificationList = await utilities.buildClassificationList(invData.classification_id); // dropdown

        if (!invData) {
            req.flash("notice", "Inventory item not found.");
            return res.redirect("/inv");
        }

        res.render("inventory/edit-inventory", {
            title: `Edit ${invData.inv_make} ${invData.inv_model}`,
            nav,
            invData,
            classificationList,
            errors: null
        });
    } catch (error) {
        next(error);
    }
};






invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        classification_name: "",
    })
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  let nav = await utilities.getNav();
  
  // Add debug log
  console.log("Attempting to add classification:", classification_name);

  const regResult = await invModel.addClassification(classification_name);

  if (regResult) {
    // Force refresh the navigation
    nav = await utilities.getNav();
    
    req.flash("notice", `Classification ${classification_name} was successfully added.`);
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the classification addition failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name,
    });
  }
}

invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
        inv_make: '',
        inv_model: '',
        inv_year: '',
        inv_description: '',
        inv_image: '/images/vehicles/no-image.png',
        inv_thumbnail: '/images/vehicles/no-image-tn.png',
        inv_price: '',
        inv_miles: '',
        inv_color: '',
        classification_id: null
    });
}

invCont.addInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
    } = req.body;

    const regResult = await invModel.addInventory(
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
    );

    if (regResult) {
        req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`);
        res.status(201).render("inventory/management", {
            title: "Inventory Management",
            nav,
        });
    } else {
        let classificationList = await utilities.buildClassificationList(classification_id);
        req.flash("notice", "Sorry, the inventory addition failed.");
        res.status(501).render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            classificationList,
            ...req.body
        });
    }
}

// In invController.js
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData.length > 0) {
    return res.json(invData)
  } else {
    return res.json([])
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id); // collect inventory id from URL

    // Build navigation
    let nav = await utilities.getNav();

    // Get inventory item data
    const itemData = await invModel.getInventoryById(inv_id);

    // Build classification select dropdown
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);

    // Build title
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    // Render edit-inventory view
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update inventory item in DB
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    } = req.body;

    const result = await invModel.updateInventory(
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    );

    if (result) {
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully updated.`);
      res.redirect("/inv"); // redirect back to management page
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.status(500).render("inventory/edit-inventory", {
        title: `Edit ${inv_make} ${inv_model}`,
        nav: await utilities.getNav(),
        classificationSelect: await utilities.buildClassificationList(classification_id),
        errors: null,
        ...req.body
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Show Delete Confirmation
 * ************************** */
invCont.confirmDelete = async function(req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id);
        const itemData = await invModel.getInventoryById(inv_id);
        const nav = await utilities.getNav();

        if (!itemData) {
            req.flash("notice", "Inventory item not found.");
            return res.redirect("/inv");
        }

        res.render("inventory/delete-inventory", {
            title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
            nav,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model
        });
    } catch (error) {
        next(error);
    }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function(req, res, next) {
    try {
        const { inv_id } = req.body;

        const result = await invModel.deleteInventory(inv_id);

        if (result) {
            req.flash("notice", "Inventory item was successfully deleted.");
            res.redirect("/inv");
        } else {
            req.flash("notice", "Sorry, the deletion failed.");
            res.redirect("/inv");
        }
    } catch (error) {
        next(error);
    }
}



module.exports = invCont;