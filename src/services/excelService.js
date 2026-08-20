/**
 * excelService.js — All Excel I/O using SheetJS (xlsx), fully client-side.
 *
 * Holds the current workbook in memory. Supports:
 *  - Creating a fresh workbook
 *  - Loading an existing .xlsx from a File/Blob
 *  - Syncing headers from the field schema (adding new columns as needed)
 *  - Appending a row of form data
 *  - Downloading the workbook as .xlsx
 */
import * as XLSX from "xlsx";
import { diffNewColumns } from "./schemaService.js";

const SHEET_NAME = "Submissions";

/* ── Internal state ────────────────────────────────────────────── */

let workbook = null; // XLSX.WorkBook | null

/* ── Helpers ───────────────────────────────────────────────────── */

/** Get (or create) the Submissions sheet. */
function getSheet() {
  if (!workbook) {
    workbook = XLSX.utils.book_new();
  }
  let sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    sheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME);
  }
  return sheet;
}

/** Read header labels from row 1. Returns a Set<string>. */
function getHeaderLabels(sheet) {
  const labels = new Set();
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    const cell = sheet[addr];
    if (cell && cell.v != null) labels.add(String(cell.v));
  }
  return labels;
}

/** Total number of used rows (including header). */
function rowCount(sheet) {
  if (!sheet["!ref"]) return 0;
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  return range.e.r + 1;
}

/** Total number of used columns. */
function colCount(sheet) {
  if (!sheet["!ref"]) return 0;
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  return range.e.c + 1;
}

/** Expand the sheet's !ref to include (row, col). */
function expandRef(sheet, row, col) {
  if (!sheet["!ref"]) {
    sheet["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: col } });
    return;
  }
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  if (row > range.e.r) range.e.r = row;
  if (col > range.e.c) range.e.c = col;
  sheet["!ref"] = XLSX.utils.encode_range(range);
}

/* ── Public API ────────────────────────────────────────────────── */

/**
 * Load an existing .xlsx file (from <input type="file">).
 * Replaces the in-memory workbook entirely.
 * @param {File} file
 */
export async function loadFromFile(file) {
  const buf = await file.arrayBuffer();
  workbook = XLSX.read(buf, { type: "array" });
}

/**
 * Ensure the header row matches the current field schema.
 * Adds new columns for any fields whose labels aren't already present.
 * Never removes or reorders existing columns.
 * @param {Array} fields — current schema from fields.json
 * @returns {{ added: string[] }} — labels of newly added columns
 */
export function syncHeaders(fields) {
  const sheet = getSheet();
  const existing = getHeaderLabels(sheet);
  const rows = rowCount(sheet);

  // First time — write all headers
  if (rows === 0) {
    fields.forEach((f, i) => {
      const addr = XLSX.utils.encode_cell({ r: 0, c: i });
      sheet[addr] = { t: "s", v: f.label };
    });
    expandRef(sheet, 0, fields.length - 1);

    // Set column widths
    sheet["!cols"] = fields.map(() => ({ wch: 22 }));

    return { added: fields.map((f) => f.label) };
  }

  // Diff and append new columns
  const toAdd = diffNewColumns(existing, fields);
  if (toAdd.length === 0) return { added: [] };

  let nextCol = colCount(sheet);
  for (const field of toAdd) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: nextCol });
    sheet[addr] = { t: "s", v: field.label };
    expandRef(sheet, 0, nextCol);
    nextCol++;
  }

  // Extend column widths
  const cols = sheet["!cols"] || [];
  while (cols.length < nextCol) cols.push({ wch: 22 });
  sheet["!cols"] = cols;

  return { added: toAdd.map((f) => f.label) };
}

/**
 * Append one form submission as a new row.
 * Maps each field's value to its column by matching the header label.
 * @param {Object} formData — { fieldId: value, … }
 * @param {Array}  fields   — current schema
 */
export function appendRow(formData, fields) {
  // Make sure headers are in sync first
  syncHeaders(fields);

  const sheet = getSheet();
  const headerLabels = getHeaderLabels(sheet);

  // Build label → column index map
  const labelToCol = {};
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    const cell = sheet[addr];
    if (cell && cell.v != null) labelToCol[String(cell.v)] = c;
  }

  const newRow = rowCount(sheet); // 0-indexed, next available row

  for (const field of fields) {
    const col = labelToCol[field.label];
    if (col === undefined) continue;

    let value = formData[field.id];
    if (field.type === "checkbox") value = value ? "Yes" : "No";
    if (value === undefined || value === null) value = "";

    const addr = XLSX.utils.encode_cell({ r: newRow, c: col });
    sheet[addr] = { t: "s", v: String(value) };
    expandRef(sheet, newRow, col);
  }

  return newRow; // row index of the newly added row
}

/**
 * Download the current workbook as an .xlsx file.
 * @param {string} [filename="submissions.xlsx"]
 */
export function download(filename = "submissions.xlsx") {
  if (!workbook) return;
  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get the current row count (excluding header).
 * @returns {number}
 */
export function getSubmissionCount() {
  if (!workbook) return 0;
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) return 0;
  const rows = rowCount(sheet);
  return rows > 0 ? rows - 1 : 0;
}

/**
 * Check if a workbook is loaded.
 * @returns {boolean}
 */
export function hasWorkbook() {
  return workbook !== null;
}

/**
 * Reset the in-memory workbook (start fresh).
 */
export function reset() {
  workbook = null;
}
