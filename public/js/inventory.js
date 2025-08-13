'use strict';

// Get inventory items based on classification
document.querySelector("#classificationList").addEventListener("change", function() {
  const classification_id = this.value;
  console.log(`classification_id is: ${classification_id}`);
  
  // Ensure this URL matches your route
  const classIdURL = `/inv/getInventory/${classification_id}`;
  
  fetch(classIdURL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Received data:", data);
      buildInventoryList(data);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
});

// Build inventory items into HTML table
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  
  // Clear existing table data
  inventoryDisplay.innerHTML = '';
  
  // Set up table structure
  let dataTable = '<thead>';
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
  dataTable += '</thead><tbody>';
  
  // Add each inventory item as a row
  data.forEach(function(element) {
    console.log(`${element.inv_id}, ${element.inv_model}`);
    
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
  });
  
  dataTable += '</tbody>';
  
  // Display the contents in the view
  inventoryDisplay.innerHTML = dataTable;
}