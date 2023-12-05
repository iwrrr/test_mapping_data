const xlsx = require("xlsx");

const getReceiptsFromExcel = () => {
  const receipts = [];
  var workbook = xlsx.readFile(`./data/receipts.xls`);
  var first_sheet_name = workbook.SheetNames[0];
  var address_of_cell = "No Resi";
  var worksheet = workbook.Sheets[first_sheet_name];
  const columnName = Object.keys(worksheet).find(
    (key) => worksheet[key].v === address_of_cell
  );

  for (let key in worksheet) {
    if (key.toString()[0] === columnName[0]) {
      receipts.push(worksheet[key].v);
    }
  }

  // Remove column title
  receipts.shift();

  // console.log("Result list", resi);

  // return receipts.slice(0, 100);
  return receipts;
};

const getReceiptStatusFromExcel = () => {
  const status = [];
  var workbook = xlsx.readFile(`./data/receipts.xls`);
  var first_sheet_name = workbook.SheetNames[0];
  var address_of_cell = "Status Kiriman";
  var worksheet = workbook.Sheets[first_sheet_name];
  const columnName = Object.keys(worksheet).find(
    (key) => worksheet[key].v === address_of_cell
  );

  for (let key in worksheet) {
    if (key.toString()[0] === columnName[0]) {
      status.push(worksheet[key].v);
    }
  }

  // Remove column title
  status.shift();

  console.log("Result list", status);

  // return receipts.slice(0, 100);
  return status;
};

// console.log(getReceiptsFromExcel());

module.exports = { getReceiptsFromExcel, getReceiptStatusFromExcel };
