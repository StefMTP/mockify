import ShopifyClient from "../utils/shopify";
import { generateProductData } from "../utils/faker";
import logger from "../utils/logger";
import config from "../utils/config";

export default async function generateProducts(count: number) {
  const client = new ShopifyClient();
  const products = [];

  logger.info(`🚀 Generating ${count} products for shop: ${config.shop}...`);

  for (let i = 0; i < count; i++) {
    try {
      const productData = generateProductData();

      //TODO: call the shopify client with the proper graphql mutations to create products, options and variants
      //TODO: check for errors and push logs in final data table
    } catch (err) {}
  }
}
