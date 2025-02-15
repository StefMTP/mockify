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

export default async function fetchProducts() {
  try {
    const format = await select<"JSON" | "CSV">({
      message: "Do you want to save the products as JSON or CSV?",
      choices: ["JSON", "CSV"],
      default: "JSON",
    });
    logger.info(
      "🚀 Fetching all products from your Shopify store. Please wait, as this may take some time..."
    );
    const shopify = new ShopifyClient();
    const products = await shopify.getAllProducts();
    const savePath = getSavePath();
    if (format === "CSV") {
      const csv = parse(products);
      fs.writeFileSync(path.join(savePath, "products.csv"), csv);
      logger.info(`✅ Products saved as CSV to: ${savePath}/products.csv`);
    } else {
      fs.writeFileSync(path.join(savePath, "products.json"), JSON.stringify({ products }, null, 2));
      logger.info(`✅ Products saved as JSON to: ${savePath}/products.json`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
