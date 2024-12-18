import ShopifyClient from "../utils/shopify.js";
import { generateOrderData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";

export default async function generateOrders(count: number) {
  const shopify = new ShopifyClient();
  const orders = [];

  logger.info(`🚀 Generating ${count} orders for shop: ${config.shop}...`);

  for (let i = 0; i < count; i++) {
    try {
      const orderData = generateOrderData();
      const order = await shopify.createOrderMutation(orderData, {
        inventoryBehaviour: "BYPASS",
        sendReceipt: false,
      });
      orders.push({ Order: order.name, ID: order.id });
      logger.info(`✅ Created order: ${order.name}`);
    } catch (err) {
      logger.error(`❌ Error creating order: ${err}`);
    }
  }

  if (orders.length) logger.info(orders); // Log orders as a table
  logger.info("🎉 Order generation completed!");
}
