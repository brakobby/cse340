'use strict';

document.addEventListener("DOMContentLoaded", function () {
  const classificationList = document.getElementById("classificationList");
  const inventoryDisplay = document.getElementById("inventoryDisplay").querySelector("tbody");

  if (!classificationList || !inventoryDisplay) {
    console.error("Required elements not found in DOM");
    return;
  }

  classificationList.addEventListener("change", function (e) {
    e.preventDefault(); // prevent page reload

    const classification_id = this.value;
    console.log(`classification_id is: ${classification_id}`);

    if (!classification_id) {
      inventoryDisplay.innerHTML = '';
      return;
    }

    const url = `/inv/getInventory/${classification_id}`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  function buildInventoryList(data) {
    inventoryDisplay.innerHTML = ''; // clear existing rows

    if (!data || data.length === 0) {
      inventoryDisplay.innerHTML = `<tr><td colspan="3">No vehicles found for this classification.</td></tr>`;
      return;
    }

    data.forEach(item => {
      const row = document.createElement("tr");

      // Vehicle name
      const nameCell = document.createElement("td");
      nameCell.textContent = `${item.inv_make} ${item.inv_model}`;
      row.appendChild(nameCell);

      // Modify link
      const modifyCell = document.createElement("td");
      const modifyLink = document.createElement("a");
      modifyLink.href = `/inv/edit/${item.inv_id}`;
      modifyLink.title = "Click to update";
      modifyLink.textContent = "Modify";
      modifyCell.appendChild(modifyLink);
      row.appendChild(modifyCell);

      // Delete link
      const deleteCell = document.createElement("td");
      const deleteLink = document.createElement("a");
      deleteLink.href = `/inv/delete/${item.inv_id}`;
      deleteLink.title = "Click to delete";
      deleteLink.textContent = "Delete";
      deleteCell.appendChild(deleteLink);
      row.appendChild(deleteCell);

      inventoryDisplay.appendChild(row);
    });
  }
});
