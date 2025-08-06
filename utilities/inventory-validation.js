const { body, validationResult } = require("express-validator");
const utilities = require("./index");
const validate = {};

validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isAlphanumeric()
            .withMessage("Classification name must be alphanumeric with no spaces")
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name.")
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: errors.array(),
            classification_name,
        });
        return;
    }
    next();
}

validate.inventoryRules = () => {
    return [
        body("classification_id")
            .notEmpty()
            .withMessage("Classification is required"),
            
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Make must be at least 3 characters"),
            
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Model must be at least 3 characters"),
            
        body("inv_year")
            .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
            .withMessage("Please enter a valid year"),
            
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Description is required"),
            
        body("inv_price")
            .isFloat({ min: 0 })
            .withMessage("Price must be a positive number"),
            
        body("inv_miles")
            .isInt({ min: 0 })
            .withMessage("Miles must be a positive number"),
            
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Color is required")
    ]
}

validate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationList = await utilities.buildClassificationList(req.body.classification_id);
        res.render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            classificationList,
            errors: errors.array(),
            ...req.body
        });
        return;
    }
    next();
}


module.exports = validate;