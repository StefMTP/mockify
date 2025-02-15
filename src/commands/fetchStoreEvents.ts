import fs from "fs";
import path from "path";
import os from "os";
import { parse } from "json2csv";
import logger from "../utils/logger.js";
import ShopifyClient from "../utils/shopify.js";
import { select } from "@inquirer/prompts";

function getSavePath(): string {
  const downloadsPath = path.join(os.homedir(), "Downloads");
  if (fs.existsSync(downloadsPath)) {
    return downloadsPath;
  }
  return path.join(os.homedir(), "Desktop");
}

export default async function fetchStoreEvents() {
  try {
    const format = await select<"JSON" | "CSV">({
      message: "Do you want to save the store events as JSON or CSV?",
      choices: ["JSON", "CSV"],
      default: "JSON",
    });
    logger.info(
      "🚀 Fetching all store events from your Shopify store. Please wait, as this may take some time..."
    );
    const shopify = new ShopifyClient();
    const events = await shopify.getAllStoreEvents();
    const savePath = getSavePath();
    if (format === "CSV") {
      const csv = parse(events);
      fs.writeFileSync(path.join(savePath, "store_events.csv"), csv);
      logger.info(`✅ Store events saved as CSV to: ${savePath}/store_events.csv`);
    } else {
      fs.writeFileSync(
        path.join(savePath, "store_events.json"),
        JSON.stringify({ events }, null, 2)
      );
      logger.info(`✅ Store events saved as JSON to: ${savePath}/store_events.json`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
