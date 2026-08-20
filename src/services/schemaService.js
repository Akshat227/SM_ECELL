/**
 * schemaService.js — Pure validation & diffing for field schemas.
 * No I/O, no side effects. Works identically in browser or Node.
 */

const ALLOWED_TYPES = new Set([
  "text", "email", "tel", "url", "password",
  "textarea", "number", "select", "checkbox", "date",
]);

/**
 * Throws a descriptive error if the schema array is malformed.
 * @param {Array} fields
 */
export function validateSchema(fields) {
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
    if (!/^[a-zA-Z0-9_]+$/.test(field.id)) {
      throw new Error(`Field id "${field.id}" must be alphanumeric/underscore only.`);
    }
    if (!field.label || typeof field.label !== "string") {
      throw new Error(`Field "${field.id}" needs a string "label".`);
    }
    if (!field.type || !ALLOWED_TYPES.has(field.type)) {
      throw new Error(
        `Field "${field.id}" has unknown type "${field.type}". ` +
        `Allowed: ${[...ALLOWED_TYPES].join(", ")}.`
      );
    }
    if (field.type === "select" && !Array.isArray(field.options)) {
      throw new Error(`Select field "${field.id}" needs an "options" array.`);
    }
    if (seen.has(field.id)) {
      throw new Error(`Duplicate field id "${field.id}".`);
    }
    seen.add(field.id);
  }
}

/**
 * Returns fields present in newFields but not in oldLabels set.
 * @param {Set<string>} oldLabels — set of existing column header labels
 * @param {Array}       newFields — current field schema
 * @returns {Array}     fields that need new columns
 */
export function diffNewColumns(oldLabels, newFields) {
  return newFields.filter((f) => !oldLabels.has(f.label));
}
