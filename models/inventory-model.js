const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */

async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows || []; // Return empty array if no rows
    } catch (error) {
        console.error("getclassificationbyid error " + error);
        return []; // Return empty array on error
    }
}

async function getInventoryById(inv_id){
  try{
    const data = await pool.query(`SELECT * FROM public.inventory WHERE inv_id = $1`,[inv_id]);
    return data.rows[0];
  }catch(error){
    console.error("getInventoryById error" + error);
    return null;
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING classification_id";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0].classification_id; // Explicitly return the new ID
  } catch (error) {
    console.error("addClassification error:", error);
    return null;
  }
}

async function addInventory(
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
) {
    try {
        const sql = `INSERT INTO inventory (
            classification_id, inv_make, inv_model, inv_year, 
            inv_description, inv_image, inv_thumbnail, 
            inv_price, inv_miles, inv_color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        
        return await pool.query(sql, [
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
        ]);
    } catch (error) {
        // return error.message;
        console.error("Error in addInventory: ",error)
        return null;
    }
}

/* ***************************
 *  Update an inventory item
 * ************************** */

async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE inventory
      SET classification_id = $1,
          inv_make = $2,
          inv_model = $3,
          inv_year = $4,
          inv_description = $5,
          inv_image = $6,
          inv_thumbnail = $7,
          inv_price = $8,
          inv_miles = $9,
          inv_color = $10
      WHERE inv_id = $11
      RETURNING *;
    `;
    const values = [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_id
    ];
    const result = await pool.query(sql, values);
    return result.rowCount > 0; // true if updated
  } catch (error) {
    console.error("Error in updateInventory model:", error);
    return false;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
    try {
        const sql = "DELETE FROM inventory WHERE inv_id = $1";
        const result = await pool.query(sql, [inv_id]);
        return result.rowCount > 0; // true if deleted
    } catch (error) {
        console.error("Error deleting inventory:", error);
        return false;
    }
}





module.exports = {getClassifications,getInventoryByClassificationId,getInventoryById,addClassification,addInventory,updateInventory,deleteInventory}