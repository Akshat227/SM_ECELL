const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const WORKBOOK_PATH = path.join(__dirname, "..", "data", "submissions.xlsx");
const SHEET_NAME = "Submissions";

/** Open the existing workbook, or start a fresh one if it doesn't exist yet. */
async function loadWorkbook() {
  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(WORKBOOK_PATH)) {
    await workbook.xlsx.readFile(WORKBOOK_PATH);
  }
  let sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    sheet = workbook.addWorksheet(SHEET_NAME);
  }
  return { workbook, sheet };
}

/** Map of "column label" -> "1-based column index" from row 1. */
function headerIndex(sheet) {
  const map = {};
  const headerRow = sheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    if (cell.value) map[String(cell.value)] = colNumber;
  });
  return map;
}

/** Sync workbook headers with schema: add missing fields as new columns at the end. */
async function syncWorkbook(fields) {
  const { workbook, sheet } = await loadWorkbook();

  if (sheet.rowCount === 0) {
    // Fresh sheet -> set all column headers
    sheet.addRow(fields.map((f) => f.label));
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => (col.width = 22));
    await workbook.xlsx.writeFile(WORKBOOK_PATH);
    return;
  }

  // Sheet already exists -> check if any fields in fields.json are missing from header row
  const existingHeaders = headerIndex(sheet);
  let lastCol = sheet.columnCount || 0;
  let modified = false;

  for (const field of fields) {
    if (!existingHeaders[field.label]) {
      lastCol += 1;
      const headerRow = sheet.getRow(1);
      headerRow.getCell(lastCol).value = field.label;
      modified = true;
    }
  }

  if (modified) {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).commit();
    sheet.columns.forEach((col) => (col.width = col.width || 22));
    await workbook.xlsx.writeFile(WORKBOOK_PATH);
  }
}

/** Append one submission as a new row in submissions.xlsx on host disk. */
async function appendRow(data, fields) {
  await syncWorkbook(fields);
  const { workbook, sheet } = await loadWorkbook();
  const colByLabel = headerIndex(sheet);
  const newRow = sheet.getRow(sheet.rowCount + 1);

  for (const field of fields) {
    const col = colByLabel[field.label];
    if (!col) continue;
    let value = data[field.id];
    if (field.type === "checkbox") value = value ? "Yes" : "No";
    if (value === undefined || value === null) value = "";
    newRow.getCell(col).value = value;
  }
  newRow.commit();
  await workbook.xlsx.writeFile(WORKBOOK_PATH);
}

module.exports = { syncWorkbook, appendRow, WORKBOOK_PATH };
