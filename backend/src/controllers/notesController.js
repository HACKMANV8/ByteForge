// // // import fs from "fs";
// // // import pdf from "pdf-parse";
// // //
// // import fs from "fs";
// // let pdf;
// // (async () => {
// //   const module = await import("pdf-parse");
// //   pdf = module.default || module;
// // })();
// // //
// // import { chatComplete } from "../utils/aiGenerator.js";
// // import Result from "../models/resultModel.js";


// //
// import fs from "fs";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdf = require("pdf-parse");

// import { chatComplete } from "../utils/aiGenerator.js";
// import Result from "../models/resultModel.js";
// //


// export async function processNotes(req, res) {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     let textContent = "";
//     if (req.file.mimetype === "application/pdf") {
//       const dataBuffer = fs.readFileSync(req.file.path);
//       const pdfData = await pdf(dataBuffer);
//       textContent = pdfData.text;
//     } else {
//       textContent = fs.readFileSync(req.file.path, "utf-8");
//     }

//     const messages = [
//       { role: "system", content: `You are an ADHD-friendly study assistant. Break down complex content into:\n1. Key Concepts\n2. Digestible Chunks\n3. Practice Questions\n4. Study Tips\nUse clear formatting.` },
//       { role: "user", content: `Process these notes:\n\n${textContent.substring(0, 15000)}` },
//     ];
//     const processedContent = await chatComplete(messages, { temperature: 0.7, max_tokens: 2000 });

//     try { fs.unlinkSync(req.file.path); } catch {}

//     try {
//       await Result.create({
//         user: req.user?.id,
//         type: "notes",
//         inputMetadata: {
//           filename: req.file.originalname,
//           mimetype: req.file.mimetype,
//           size: req.file.size,
//           originalLength: textContent.length,
//         },
//         content: { processed: processedContent, sourceText: textContent.substring(0, 15000) },
//       });
//     } catch {}

//     res.json({ success: true, processed: processedContent, originalLength: textContent.length });
//   } catch (error) {
//     console.error("Error processing notes:", error);
//     res.status(500).json({ error: "Failed to process notes.", details: error.message });
//   }
// }


//////




// // src/controllers/notesController.js

// import fs from "fs";
// import { createRequire } from "module";
// import { chatComplete } from "../utils/aiGenerator.js";
// import Result from "../models/resultModel.js";

// // ──────────────────────────────────────────────────────────────
// //  pdf-parse is a CommonJS package → use createRequire + require
// // ──────────────────────────────────────────────────────────────
// const require = createRequire(import.meta.url);
// const pdf = require("pdf-parse");   // <-- this is the function

// export async function processNotes(req, res) {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     let textContent = "";

//     // ───── PDF ─────
//     if (req.file.mimetype === "application/pdf") {
//       const dataBuffer = fs.readFileSync(req.file.path);
//       const pdfData = await pdf(dataBuffer);   // <-- correct call
//       textContent = pdfData.text;
//     }
//     // ───── TEXT / OTHER ─────
//     else {
//       textContent = fs.readFileSync(req.file.path, "utf-8");
//     }

//     // ───── AI PROMPT ─────
//     const messages = [
//       {
//         role: "system",
//         content:
//           "You are an ADHD-friendly study assistant. Break down complex content into:\n" +
//           "1. Key Concepts\n" +
//           "2. Digestible Chunks\n" +
//           "3. Practice Questions\n" +
//           "4. Study Tips\n" +
//           "Use clear formatting with #, ##, **bold**, and bullet points.",
//       },
//       {
//         role: "user",
//         content: `Process these notes:\n\n${textContent.substring(0, 15000)}`,
//       },
//     ];

//     const processedContent = await chatComplete(messages, {
//       temperature: 0.7,
//       max_tokens: 2000,
//     });

//     // ───── CLEAN-UP ─────
//     try { fs.unlinkSync(req.file.path); } catch {}

//     // ───── SAVE RESULT (optional) ─────
//     try {
//       await Result.create({
//         user: req.user?.id,
//         type: "notes",
//         inputMetadata: {
//           filename: req.file.originalname,
//           mimetype: req.file.mimetype,
//           size: req.file.size,
//           originalLength: textContent.length,
//         },
//         content: {
//           processed: processedContent,
//           sourceText: textContent.substring(0, 15000),
//         },
//       });
//     } catch {}

//     // ───── SUCCESS RESPONSE ─────
//     res.json({
//       success: true,
//       processed: processedContent,
//       originalLength: textContent.length,
//     });
//   } catch (error) {
//     console.error("Error processing notes:", error);
//     res.status(500).json({
//       error: "Failed to process notes.",
//       details: error.message,
//     });
//   }
// }


///


import fs from "fs";
import { chatComplete } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

// pdf-parse v2.4.5 uses ES module with PDFParse class
import { PDFParse } from "pdf-parse";

export async function processNotes(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let textContent = "";
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const parser = new PDFParse({ data: dataBuffer });
      try {
        const result = await parser.getText();
        textContent = result.text;
      } finally {
        await parser.destroy();
      }
    } else {
      textContent = fs.readFileSync(req.file.path, "utf-8");
    }

    const messages = [
      { role: "system", content: `You are an ADHD-friendly study assistant. Break down complex content into:\n1. Key Concepts\n2. Digestible Chunks\n3. Practice Questions\n4. Study Tips\nUse clear formatting.` },
      { role: "user", content: `Process these notes:\n\n${textContent.substring(0, 15000)}` },
    ];
    const processedContent = await chatComplete(messages, { temperature: 0.7, max_tokens: 2000 });

    try { fs.unlinkSync(req.file.path); } catch {}

    try {
      await Result.create({
        user: req.user?.id,
        type: "notes",
        inputMetadata: {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          originalLength: textContent.length,
        },
        content: { processed: processedContent, sourceText: textContent.substring(0, 15000) },
      });
    } catch {}

    res.json({ success: true, processed: processedContent, originalLength: textContent.length });
  } catch (error) {
    console.error("Error processing notes:", error);
    res.status(500).json({ error: "Failed to process notes.", details: error.message });
  }
}

