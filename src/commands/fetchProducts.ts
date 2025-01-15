import fs from "fs";
import logger from "../utils/logger.js";
import ShopifyClient from "../utils/shopify.js";

export default async function fetchProducts() {
  try {
    logger.info("🚀 Fetching all products from your Shopify store...");
    const shopify = new ShopifyClient();
    console.time("GraphQL");
    const products = await shopify.getAllProducts();
    console.timeEnd("GraphQL");
    fs.writeFileSync(
      "products.json",
      JSON.stringify({ count: products!.length, products }, null, 2)
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
