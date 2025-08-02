const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* *************************************
 * build invention by classification view
 * *********************************** */

invCont.buildByClassificationId = async function (req, res, next){
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
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

module.exports = invCont;