const fs = require("fs/promises");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "..", "data", "fields.json");

/** Read the current field schema from disk. */
async function getSchema() {
  const raw = await fs.readFile(SCHEMA_PATH, "utf-8");
  return JSON.parse(raw);
}

/** Validate schema format. */
function validateSchema(fields) {
  if (!Array.isArray(fields)) {
    throw new Error("Schema must be a JSON array of field objects.");
  }
  const seen = new Set();
  for (const field of fields) {
    if (!field || typeof field !== "object") {
      throw new Error("Every field must be an object.");
    }
    if (!field.id || typeof field.id !== "string") {
      throw new Error('Every field needs a string "id".');
    }
    if (!field.label || typeof field.label !== "string") {
      throw new Error(`Field "${field.id}" needs a string "label".`);
    }
    if (seen.has(field.id)) {
      throw new Error(`Duplicate field id "${field.id}".`);
    }
    seen.add(field.id);
  }
}

module.exports = { getSchema, validateSchema };
