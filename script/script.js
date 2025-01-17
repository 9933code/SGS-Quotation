// Past data
let quotation_data = JSON.parse(localStorage.getItem("quotation")) || {}

// Get today's date in the format YYYY-MM-DD
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero
const dd = String(today.getDate()).padStart(2, '0');      // Add leading zero
const formattedDate = `${yyyy}-${mm}-${dd}`;
// Set the default value for the input
document.getElementById('quotation-date').value = formattedDate;

// Adding the new row
document.getElementById('addRowBtn').addEventListener('click', function() {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];

  // Creating a new row
  const newRow = tableBody.insertRow();

  // Creating cells for the new row
  const srNoCell = newRow.insertCell(0);
  const descCell = newRow.insertCell(1);
  const makeCell = newRow.insertCell(2);
  const quantityCell = newRow.insertCell(3);
  const unitsCell = newRow.insertCell(4);
  const rateCell = newRow.insertCell(5);
  const amountCell = newRow.insertCell(6);

  // Setting up inputs for each cell
  // srNoCell.textContent    = tableBody.rows.length;
  srNoCell.innerHTML      = '<div class="sn"><div class="remove-btn"><button class="remove-row-btn">-</button></div>' + tableBody.rows.length + '</div>';
  descCell.innerHTML      = '<textarea type="text"   placeholder="Enter Description"></textarea>';
  makeCell.innerHTML      = '<input type="text"   placeholder="Enter Make">';
  quantityCell.innerHTML  = '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Qty"></div>';
  unitsCell.innerHTML     = '<div  class="non-printable-format"><select><option value="Pcs">Pcs</option><option value="Set">Set</option><option value="Meter">Meter</option><option value="Ltr">Ltr</option><option value="Unit">Unit</option><option value="Visit">Visit</option><option value="Kg">Kg</option></select></div>';
  rateCell.innerHTML      = '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Rate" step="0.1"></div>';
  amountCell.innerHTML    = '<div class="input-no non-printable-format"><input type="number" placeholder="Amount" step="0.1" id="amount'+tableBody.rows.length+'" readonly></div>';

  // Adding event listener for removing row
  const removeBtn = newRow.querySelector('.remove-row-btn');
  removeBtn.addEventListener('click', function() {
    tableBody.deleteRow(newRow.rowIndex - 1);
    updateRowNumbers();
  });

  // Adjust height of text area
  // Adjust height based on content
  const textArea = newRow.querySelector('textarea');

  // Function to adjust height dynamically
  const adjustHeight = () => {
      textArea.style.height = '1.5rem'; // Reset to recalculate
      const newHeight = textArea.scrollHeight; // Calculate the required height
      textArea.style.height = `${newHeight}px`; // Apply the new height
  };

  // Listen to input events
  textArea.addEventListener('input', adjustHeight);

  // Adding event listener for calculating amount
  const inputNo       = newRow.querySelectorAll('input[type="number"]');
  const quantityInput = inputNo[0];
  const rateInput     = inputNo[1];
  const amountInput   = inputNo[2];

  quantityInput.addEventListener('input', calculateAmount);
  rateInput.addEventListener('input', calculateAmount);

  function calculateAmount() {
    const quantity = parseFloat(quantityInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    amountInput.value = (quantity * rate).toFixed(2);

    let total_sum = 0; // Initialize total
    let total_items = tableBody.rows.length; // Initialize total

    for (let i=1; i<=total_items; i++){
      const input = document.getElementById(`amount${i}`);
      if (!input) break; // Exit loop if input doesn't exist

      // Add value if it's a number
      const value = parseFloat(input.value) || 0; // Default to 0 if empty or invalid
      total_sum += value;
    }
    const subTotal = document.getElementsByName('sub-total')[0];
    subTotal.value = total_sum.toFixed(2);
    
    const gstPerc = parseFloat(document.getElementsByName('gst-perc')[0].value);
    const gst     = document.getElementsByName('gst')[0];
    const total   = document.getElementsByName('total')[0];

    gst.value     = (total_sum * gstPerc / 100 ).toFixed(2);
    total.value   = (total_sum + (total_sum * gstPerc / 100)).toFixed(2);
  }

  // Remove border once data is entered
  const inputs = newRow.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (input.value.trim() !== "") {
        input.style.border = "none";
      }
    });
  });
});
  
// Update Sr No after row removal
function updateRowNumbers() {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  const rows = tableBody.rows;

  for (let i = 0; i < rows.length; i++) {
    // Update the Sr No and create a structure for the row's first cell
    rows[i].cells[0].innerHTML =
      '<div class="sn"><div class="remove-btn"><button class="remove-row-btn">-</button></div>' + (i + 1) + '</div>';

    // Select the remove button inside the current row
    const removeBtn = rows[i].cells[0].querySelector('.remove-row-btn');

    // Remove any previously attached event listeners
    removeBtn.replaceWith(removeBtn.cloneNode(true));
    const updatedRemoveBtn = rows[i].cells[0].querySelector('.remove-row-btn');

    // Attach the event listener to delete the current row
    updatedRemoveBtn.addEventListener('click', function () {
      tableBody.deleteRow(i); // Directly delete the current row
      updateRowNumbers(); // Re-update the Sr No for the remaining rows
    });
  }
}

// Save during print
function save(){
  //Get Stored Data
  quotation_data = JSON.parse(localStorage.getItem("quotation")) || {};
  let table_data = {};

  //Existing Data
  const quotation_no = document.getElementsByName('quotation-no')[0].value;
  const quotation_date = document.getElementsByName('quotation-date')[0].value;
  const customer_name = document.getElementsByName('customer-name')[0].value;
  const customer_details = document.getElementsByName('customer-details')[0].value;
  const contact_person_name = document.getElementsByName('person-name')[0].value;
  const contact_person_no = document.getElementsByName('contact-no')[0].value;
  const sub_total = document.getElementsByName('sub-total')[0].value;
  const gst_perc = document.getElementsByName('gst-perc')[0].value;
  const gst = document.getElementsByName('gst')[0].value;
  const total = document.getElementsByName('total')[0].value;

  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  const rows = tableBody.rows;

  for (let i = 0; i < rows.length; i++) {
    table_data = {...table_data, [i+1] :  {
      desc : rows[i].cells[1].getElementsByTagName('textarea')[0].value,
      maker : rows[i].cells[2].getElementsByTagName('input')[0].value,
      qty : rows[i].cells[3].getElementsByTagName('input')[0].value,
      unit : rows[i].cells[4].getElementsByTagName('select')[0].value,
      rate : rows[i].cells[5].getElementsByTagName('input')[0].value,
      amount : rows[i].cells[6].getElementsByTagName('input')[0].value,
    }}
  }

  //Append with existing data
  quotation_data = {...quotation_data, [quotation_no] : {
      quotation_no      : quotation_no,
      quotation_date    : quotation_date,
      customer_name     : customer_name,
      customer_details  : customer_details,
      contact_person_name  : contact_person_name,
      contact_person_no  : contact_person_no,
      sub_total:sub_total,
      gst_perc:gst_perc,
      gst:gst,
      total:total,
      items:table_data
    },
  };

  localStorage.setItem("quotation", JSON.stringify(quotation_data));
}

// update table for data
document.getElementById('quotation-no').addEventListener('input', function() {
  const quotation_no = document.getElementsByName('quotation-no')[0].value;

  if (Object.keys(quotation_data).includes(quotation_no)) {
    // console.log(quotation_data[quotation_no]);
    document.getElementsByName('quotation-date')[0].value = quotation_data[quotation_no]['quotation_date'];
    document.getElementsByName('customer-name')[0].value = quotation_data[quotation_no]['customer_name'];
    document.getElementsByName('customer-details')[0].value = quotation_data[quotation_no]['customer_details'];
    document.getElementsByName('person-name')[0].value = quotation_data[quotation_no]['contact_person_name'];
    document.getElementsByName('contact-no')[0].value = quotation_data[quotation_no]['contact_person_no'];
    document.getElementsByName('sub-total')[0].value = quotation_data[quotation_no]['sub_total'];
    document.getElementsByName('gst-perc')[0].value = quotation_data[quotation_no]['gst_perc'];
    document.getElementsByName('gst')[0].value = quotation_data[quotation_no]['gst'];
    document.getElementsByName('total')[0].value = quotation_data[quotation_no]['total'];
    addData(quotation_data[quotation_no]['items']);
  }
});


//Add table data
function addData(items) {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML="";

  Object.keys(items).forEach(item => {
    // Creating a new row
    const newRow = tableBody.insertRow();
    
    // Creating cells for the new row
    const srNoCell = newRow.insertCell(0);
    const descCell = newRow.insertCell(1);
    const makeCell = newRow.insertCell(2);
    const quantityCell = newRow.insertCell(3);
    const unitsCell = newRow.insertCell(4);
    const rateCell = newRow.insertCell(5);
    const amountCell = newRow.insertCell(6);
    
    // Setting up inputs for each cell
    // srNoCell.textContent    = tableBody.rows.length;
    srNoCell.innerHTML      = '<div class="sn"><div class="remove-btn"><button class="remove-row-btn">-</button></div>' + tableBody.rows.length + '</div>';
    descCell.innerHTML      = '<textarea type="text"   placeholder="Enter Description"></textarea>';
    makeCell.innerHTML      = '<input type="text"   placeholder="Enter Make">';
    quantityCell.innerHTML  = '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Qty"></div>';
    unitsCell.innerHTML     = '<div  class="non-printable-format"><select><option value="Pcs">Pcs</option><option value="Set">Set</option><option value="Meter">Meter</option><option value="Ltr">Ltr</option><option value="Unit">Unit</option><option value="Visit">Visit</option><option value="Kg">Kg</option></select></div>';
    rateCell.innerHTML      = '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Rate" step="0.1"></div>';
    amountCell.innerHTML    = '<div class="input-no non-printable-format"><input type="number" placeholder="Amount" step="0.1" id="amount'+tableBody.rows.length+'" readonly></div>';
    
    descCell.getElementsByTagName('textarea')[0].value = items[item].desc;
    makeCell.getElementsByTagName('input')[0].value = items[item].maker;
    quantityCell.getElementsByTagName('input')[0].value = items[item].qty;
    unitsCell.getElementsByTagName('select')[0].value = items[item].unit;
    rateCell.getElementsByTagName('input')[0].value = items[item].rate;
    amountCell.getElementsByTagName('input')[0].value = items[item].amount;

    // Adding event listener for removing row
    const removeBtn = newRow.querySelector('.remove-row-btn');
    removeBtn.addEventListener('click', function() {
      tableBody.deleteRow(newRow.rowIndex - 1);
      updateRowNumbers();
    });
  
    // Adjust height of text area
    // Adjust height based on content
    const textArea = newRow.querySelector('textarea');
  
    // Function to adjust height dynamically
    const adjustHeight = () => {
        textArea.style.height = '1.5rem'; // Reset to recalculate
        const newHeight = textArea.scrollHeight; // Calculate the required height
        textArea.style.height = `${newHeight}px`; // Apply the new height
    };
  
    // Listen to input events
    textArea.addEventListener('input', adjustHeight);
  
    // Adding event listener for calculating amount
    const inputNo       = newRow.querySelectorAll('input[type="number"]');
    const quantityInput = inputNo[0];
    const rateInput     = inputNo[1];
    const amountInput   = inputNo[2];
  
    quantityInput.addEventListener('input', calculateAmount);
    rateInput.addEventListener('input', calculateAmount);
  
    function calculateAmount() {
      const quantity = parseFloat(quantityInput.value) || 0;
      const rate = parseFloat(rateInput.value) || 0;
      amountInput.value = (quantity * rate).toFixed(2);
  
      let total_sum = 0; // Initialize total
      let total_items = tableBody.rows.length; // Initialize total
  
      for (let i=1; i<=total_items; i++){
        const input = document.getElementById(`amount${i}`);
        if (!input) break; // Exit loop if input doesn't exist
  
        // Add value if it's a number
        const value = parseFloat(input.value) || 0; // Default to 0 if empty or invalid
        total_sum += value;
      }
      const subTotal = document.getElementsByName('sub-total')[0];
      subTotal.value = total_sum.toFixed(2);
      
      const gstPerc = parseFloat(document.getElementsByName('gst-perc')[0].value);
      const gst     = document.getElementsByName('gst')[0];
      const total   = document.getElementsByName('total')[0];
  
      gst.value     = (total_sum * gstPerc / 100 ).toFixed(2);
      total.value   = (total_sum + (total_sum * gstPerc / 100)).toFixed(2);
    }
  
    // Remove border once data is entered
    const inputs = newRow.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (input.value.trim() !== "") {
          input.style.border = "none";
        }
      });
    });
  });

}