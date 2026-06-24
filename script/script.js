// Past data
let quotation_data = JSON.parse(localStorage.getItem("quotation")) || {}

// Get today's date in the format YYYY-MM-DD
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const formattedDate = `${yyyy}-${mm}-${dd}`;
document.getElementById('quotation-date').value = formattedDate;

// ─── CORE: recalculate totals from all visible rows ───────────────────────────
function recalculateTotals() {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  const rows = tableBody.rows;

  let total_sum = 0;
  for (let i = 0; i < rows.length; i++) {
    // Each amount input is the 3rd number input in the row (index 2)
    const amountInput = rows[i].querySelectorAll('input[type="number"]')[2];
    if (amountInput) {
      total_sum += parseFloat(amountInput.value) || 0;
    }
  }

  const subTotal = document.getElementsByName('sub-total')[0];
  subTotal.value = total_sum.toFixed(2);

  const discountPerc = parseFloat(document.getElementsByName('discount-perc')[0].value) || 0;
  const discount = document.getElementsByName('discount')[0];
  discount.value = (total_sum * discountPerc / 100).toFixed(2);

  const total_sum_with_discount = total_sum * (100 - discountPerc) / 100;
  const subTotalDiscount = document.getElementsByName('sub-total-discount')[0];
  subTotalDiscount.value = total_sum_with_discount.toFixed(2);

  const gstPerc = parseFloat(document.getElementsByName('gst-perc')[0].value) || 0;
  const gst = document.getElementsByName('gst')[0];
  gst.value = (total_sum_with_discount * gstPerc / 100).toFixed(2);

  const total = document.getElementsByName('total')[0];
  total.value = (total_sum_with_discount + (total_sum_with_discount * gstPerc / 100)).toFixed(2);
}

// ─── Wire discount/GST fields to always recalculate ──────────────────────────
document.querySelector('div.discount > input[type=number]:nth-child(2)')
  .addEventListener('input', recalculateTotals);
document.querySelector('div.gst > input[type=number]:nth-child(2)')
  .addEventListener('input', recalculateTotals);

// ─── Attach calculation listeners to a single row ────────────────────────────
function attachRowListeners(row) {
  const inputNo = row.querySelectorAll('input[type="number"]');
  const quantityInput = inputNo[0];
  const rateInput     = inputNo[1];
  const amountInput   = inputNo[2];

  function updateRowAmount() {
    const quantity = parseFloat(quantityInput.value) || 0;
    const rate     = parseFloat(rateInput.value)     || 0;
    amountInput.value = (quantity * rate).toFixed(2);
    recalculateTotals();
  }

  quantityInput.addEventListener('input', updateRowAmount);
  rateInput.addEventListener('input', updateRowAmount);

  // Remove border on blur if value is filled
  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', function () {
      if (input.value.trim() !== "") {
        input.style.border = "none";
      }
    });
  });
}

// ─── Update Sr No and remove-button listeners after any row change ─────────────
function updateRowNumbers() {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  const rows = tableBody.rows;

  for (let i = 0; i < rows.length; i++) {
    // Rebuild Sr No cell (clones button to drop old listeners)
    rows[i].cells[0].innerHTML =
      '<div class="sn"><div class="remove-btn"><button class="remove-row-btn">-</button></div>' + (i + 1) + '</div>';

    const removeBtn = rows[i].cells[0].querySelector('.remove-row-btn');
    // Use closure-safe reference to row element, not index
    ;(function(currentRow) {
      removeBtn.addEventListener('click', function () {
        currentRow.parentNode.removeChild(currentRow);
        updateRowNumbers();
        recalculateTotals();  // recalculate after deletion
      });
    })(rows[i]);
  }
}

// ─── Add Row ──────────────────────────────────────────────────────────────────
document.getElementById('addRowBtn').addEventListener('click', function () {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  const newRow    = tableBody.insertRow();
  const rowNum    = tableBody.rows.length;

  newRow.insertCell(0).innerHTML =
    '<div class="sn"><div class="remove-btn"><button class="remove-row-btn">-</button></div>' + rowNum + '</div>';
  newRow.insertCell(1).innerHTML =
    '<div class="desc" contenteditable="True" placeholder="Enter Description"></div>';
  newRow.insertCell(2).innerHTML =
    '<input type="text" placeholder="Enter Make">';
  newRow.insertCell(3).innerHTML =
    '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Qty"></div>';
  newRow.insertCell(4).innerHTML =
    '<div class="non-printable-format"><select><option value="Pcs">Pcs</option><option value="Set">Set</option><option value="Meter">Meter</option><option value="Ft">Ft</option><option value="Ltr">Ltr</option><option value="Unit">Unit</option><option value="Visit">Visit</option><option value="Kg">Kg</option></select></div>';
  newRow.insertCell(5).innerHTML =
    '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Rate" step="0.1"></div>';
  // No more id="amountN" — just a plain readonly input
  newRow.insertCell(6).innerHTML =
    '<div class="input-no non-printable-format"><input type="number" placeholder="Amount" step="0.1" readonly></div>';

  // Remove-button listener
  const removeBtn = newRow.querySelector('.remove-row-btn');
  removeBtn.addEventListener('click', function () {
    newRow.parentNode.removeChild(newRow);
    updateRowNumbers();
    recalculateTotals();  // recalculate after deletion
  });

  attachRowListeners(newRow);
});

// ─── Save during print ────────────────────────────────────────────────────────
function save() {
  quotation_data = JSON.parse(localStorage.getItem("quotation")) || {};
  let table_data = {};

  const quotation_no           = document.getElementsByName('quotation-no')[0].value.toUpperCase();
  const head_title             = document.getElementById('head-title').innerHTML;
  const quotation_date         = document.getElementsByName('quotation-date')[0].value;
  const customer_name          = document.getElementsByName('customer-name')[0].value;
  const customer_details       = document.getElementsByName('customer-details')[0].innerHTML;
  const contact_person_name    = document.getElementsByName('person-name')[0].value;
  const contact_person_no      = document.getElementsByName('contact-no')[0].value;
  const sub_total              = document.getElementsByName('sub-total')[0].value;
  const discount_perc          = document.getElementsByName('discount-perc')[0].value;
  const discount               = document.getElementsByName('discount')[0].value;
  const sub_total_discount     = document.getElementsByName('sub-total-discount')[0].value;
  const gst_perc               = document.getElementsByName('gst-perc')[0].value;
  const gst                    = document.getElementsByName('gst')[0].value;
  const total                  = document.getElementsByName('total')[0].value;
  const terms_conditions       = document.getElementsByName('terms-condition')[0].innerHTML;

  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  const rows = tableBody.rows;

  for (let i = 0; i < rows.length; i++) {
    table_data = {
      ...table_data, [i + 1]: {
        desc:   rows[i].cells[1].getElementsByClassName('desc')[0].innerHTML,
        maker:  rows[i].cells[2].getElementsByTagName('input')[0].value,
        qty:    rows[i].cells[3].getElementsByTagName('input')[0].value,
        unit:   rows[i].cells[4].getElementsByTagName('select')[0].value,
        rate:   rows[i].cells[5].getElementsByTagName('input')[0].value,
        amount: rows[i].cells[6].getElementsByTagName('input')[0].value,
      }
    }
  }

  quotation_data = {
    ...quotation_data, [quotation_no]: {
      quotation_no, head_title, quotation_date, customer_name, customer_details,
      contact_person_name, contact_person_no,
      sub_total, discount_perc, discount, sub_total_discount,
      gst_perc, gst, total, terms_conditions,
      items: table_data
    },
  };

  localStorage.setItem("quotation", JSON.stringify(quotation_data));
}

// ─── Load saved quotation ─────────────────────────────────────────────────────
document.getElementById('quotation-no').addEventListener('input', function () {
  const quotation_no = document.getElementsByName('quotation-no')[0].value.toUpperCase();

  if (Object.keys(quotation_data).includes(quotation_no)) {
    const q = quotation_data[quotation_no];
    document.getElementById('head-title').innerHTML               = q['head_title'] || 'Quotation';
    document.getElementsByName('quotation-date')[0].value        = q['quotation_date'];
    document.getElementsByName('customer-name')[0].value         = q['customer_name'];
    document.getElementsByName('customer-details')[0].innerHTML  = q['customer_details'];
    document.getElementsByName('person-name')[0].value           = q['contact_person_name'];
    document.getElementsByName('contact-no')[0].value            = q['contact_person_no'];
    document.getElementsByName('sub-total')[0].value             = q['sub_total'];
    document.getElementsByName('discount-perc')[0].value         = q['discount_perc'];
    document.getElementsByName('discount')[0].value              = q['discount'];
    document.getElementsByName('sub-total-discount')[0].value    = q['sub_total_discount'];
    document.getElementsByName('gst-perc')[0].value              = q['gst_perc'];
    document.getElementsByName('gst')[0].value                   = q['gst'];
    document.getElementsByName('total')[0].value                 = q['total'];
    document.getElementsByName('terms-condition')[0].innerHTML   = q['terms_conditions'];
    addData(q['items']);
  }
});

// ─── Populate table from saved data ──────────────────────────────────────────
function addData(items) {
  const tableBody = document.getElementById('goodsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = "";

  Object.keys(items).forEach(item => {
    const newRow = tableBody.insertRow();
    const rowNum = tableBody.rows.length;

    newRow.insertCell(0).innerHTML =
      '<div class="sn"><div class="remove-btn"><button class="remove-row-btn">-</button></div>' + rowNum + '</div>';
    newRow.insertCell(1).innerHTML =
      '<div class="desc" contenteditable="True" placeholder="Enter Description"></div>';
    newRow.insertCell(2).innerHTML =
      '<input type="text" placeholder="Enter Make">';
    newRow.insertCell(3).innerHTML =
      '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Qty"></div>';
    newRow.insertCell(4).innerHTML =
      '<div class="non-printable-format"><select><option value="Pcs">Pcs</option><option value="Set">Set</option><option value="Meter">Meter</option><option value="Ft">Ft</option><option value="Ltr">Ltr</option><option value="Unit">Unit</option><option value="Visit">Visit</option><option value="Kg">Kg</option></select></div>';
    newRow.insertCell(5).innerHTML =
      '<div class="input-no non-printable-format"><input type="number" placeholder="Enter Rate" step="0.1"></div>';
    newRow.insertCell(6).innerHTML =
      '<div class="input-no non-printable-format"><input type="number" placeholder="Amount" step="0.1" readonly></div>';

    newRow.cells[1].getElementsByClassName('desc')[0].innerHTML  = items[item].desc;
    newRow.cells[2].getElementsByTagName('input')[0].value       = items[item].maker;
    newRow.cells[3].getElementsByTagName('input')[0].value       = items[item].qty;
    newRow.cells[4].getElementsByTagName('select')[0].value      = items[item].unit;
    newRow.cells[5].getElementsByTagName('input')[0].value       = items[item].rate;
    newRow.cells[6].getElementsByTagName('input')[0].value       = items[item].amount;

    const removeBtn = newRow.querySelector('.remove-row-btn');
    removeBtn.addEventListener('click', function () {
      newRow.parentNode.removeChild(newRow);
      updateRowNumbers();
      recalculateTotals();
    });

    attachRowListeners(newRow);
  });
}
