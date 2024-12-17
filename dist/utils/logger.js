"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, printf, colorize } = winston_1.format;
// Function to calculate column widths based on data
function calculateColumnWidths(data) {
  const columns = Object.keys(data[0]);
  return columns.map((col) => Math.max(col.length, ...data.map((row) => String(row[col]).length)));
}
// Function to format data as a table
function formatTable(data) {
  const columns = Object.keys(data[0]);
  const columnWidths = calculateColumnWidths(data);
  const separator = " | ";
  // Header row
  const header = columns.map((col, i) => col.padEnd(columnWidths[i])).join(separator);
  const line = "-".repeat(header.length + (columns.length - 1) * separator.length);
  let table = `+${line}+\n| ${header} |\n+${line}+\n`;
  // Data rows
  data.forEach((row) => {
    const rowString = columns
      .map((col, i) => String(row[col]).padEnd(columnWidths[i]))
      .join(separator);
    table += `| ${rowString} |\n`;
  });
  table += `+${line}+`;
  return table;
}
// Custom log format
const customFormat = printf(({ level, message, timestamp }) => {
  if (Array.isArray(message) && typeof message[0] === "object") {
    // Format as a table if message is an array of objects
    const table = formatTable(message);
    return `${timestamp} [${level}]:\n${table}`;
  }
  if (typeof message === "object") {
    // Format JSON objects
    return `${timestamp} [${level}]: ${JSON.stringify(message, null, 2)}`;
  }
  // Plain string messages
  return `${timestamp} [${level}]: ${message}`;
});
// Winston logger configuration
const logger = (0, winston_1.createLogger)({
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize({ all: true }),
    customFormat
  ),
  transports: [
    new winston_1.transports.Console(), // Logs to the console
    new winston_1.transports.File({ filename: "logs/app.log" }), // Logs to a file
  ],
});
exports.default = logger;
