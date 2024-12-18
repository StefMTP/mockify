import ShopifyClient from "../utils/shopify.js";
import { generateProductData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";

export default async function generateProducts(count: number) {
  const shopify = new ShopifyClient();
  const products = [];

  logger.info(`🚀 Generating ${count} products for shop: ${config.shop}...`);

  for (let i = 0; i < count; i++) {
    try {
      const productData = generateProductData();
      const product = await shopify.productSetMutation(productData, true);
      products.push({ Product: product.title, ID: product.id });
      logger.info(`✅ Created product: ${product.title}`);
    } catch (err) {
      logger.error(`❌ Error creating product: ${err}`);
    }
  }
}
