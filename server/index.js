const express = require("express");
const cors = require("cors");
const path = require("path");
const schemaService = require("./services/schemaService");
const excelService = require("./services/excelService");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Handle Chrome DevTools probe requests silently
app.get("/.well-known/*", (req, res) => {
  res.status(204).end();
});

// Boot check: Ensure submissions.xlsx exists and headers match fields.json
(async () => {
  try {
    const fields = await schemaService.getSchema();
    await excelService.syncWorkbook(fields);
    console.log("[Server] Submissions workbook initialized on host side.");
  } catch (err) {
    console.error("[Server] Boot initialization error:", err.message);
  }
})();

// GET current form schema for attendee UI
app.get("/api/schema", async (req, res) => {
  try {
    const fields = await schemaService.getSchema();
    await excelService.syncWorkbook(fields);
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit attendee form response -> Appended directly to server submissions.xlsx
app.post("/api/submit", async (req, res) => {
  try {
    const fields = await schemaService.getSchema();
    schemaService.validateSchema(fields);

    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const val = req.body[field.id];
        if (val === undefined || val === null || String(val).trim() === "") {
          return res.status(400).json({ error: `"${field.label}" is required.` });
        }
      }
    }

    // Append to Excel file on server disk
    await excelService.appendRow(req.body, fields);
    res.json({ ok: true, message: "Submission received! Thank you." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build files (dist/)
const DIST_PATH = path.join(__dirname, "..", "dist");
app.use(express.static(DIST_PATH));

// Fallback to index.html for SPA single-page routing
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`[Server] Excel form app running on http://localhost:${PORT}`);
});
