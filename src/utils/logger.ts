import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

// Define a type for table rows (key-value pairs)
type TableRow = Record<string, string | number | boolean | null | undefined>;

// Function to calculate column widths based on data
function calculateColumnWidths(data: TableRow[]): number[] {
  const columns = Object.keys(data[0]);
  return columns.map((col) =>
    Math.max(col.length, ...data.map((row) => String(row[col] ?? "").length))
  );
}

// Function to format data as a table
function formatTable(data: TableRow[]): string {
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
      .map((col, i) => String(row[col] ?? "").padEnd(columnWidths[i]))
      .join(separator);
    table += `| ${rowString} |\n`;
  });

  table += `+${line}+`;
  return table;
}

// Custom format to handle different types of messages
const customFormat = printf(({ level, rawMessage, timestamp }) => {
  if (Array.isArray(rawMessage) && typeof rawMessage[0] === "object") {
    // Format as a table if rawMessage is an array of objects
    const table = formatTable(rawMessage as TableRow[]);
    return `${timestamp} [${level}]:\n${table}`;
  }
  if (typeof rawMessage === "object") {
    // Format JSON objects
    return `${timestamp} [${level}]: ${JSON.stringify(rawMessage, null, 2)}`;
  }
  // Plain string messages
  return `${timestamp} [${level}]: ${rawMessage}`;
});

// Transform the message to preserve its original type
const preserveOriginalMessage = format((info) => {
  info.rawMessage = info.message; // Save the original message in `rawMessage`
  return info; // Pass the info object to the next format
});

// Winston logger configuration
const logger = createLogger({
  format: combine(
    preserveOriginalMessage(), // Preserve the original message
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize({ all: true }),
    customFormat
  ),
  transports: [
    new transports.Console(), // Logs to the console
    new transports.File({ filename: "logs/app.log" }), // Logs to a file
  ],
});

export default logger;
