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

invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationSelect: classificationSelect
    })
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

/* ***************************
 * Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    console.log(`Fetching inventory for classification ID: ${classification_id}`); // Debug
    
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    console.log("Inventory data:", invData); // Debug
    
    if (invData.length > 0) {
      return res.json(invData);
    } else {
      return res.json([]); // Return empty array if no data
    }
  } catch (error) {
    console.error("Error in getInventoryJSON:", error);
    next(error);
  }
}
module.exports = invCont;