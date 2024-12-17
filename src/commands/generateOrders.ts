import ShopifyClient from "../utils/shopify";
import { generateOrderData } from "../utils/faker";
import logger from "../utils/logger";
import config from "../utils/config";

export default async function generateOrders(count: number) {
  const shopify = new ShopifyClient();
  const orders = [];

  logger.info(`🚀 Generating ${count} orders for shop: ${config.shop}...`);

  for (let i = 0; i < count; i++) {
    try {
      const orderData = generateOrderData();
      const response = await shopify.createOrderMutation(orderData, {
        inventoryBehaviour: "BYPASS",
        sendReceipt: false,
      });

      if (response?.orderCreate?.userErrors?.length) {
        logger.error(
          `❌ Failed to create order: ${JSON.stringify(response?.orderCreate?.userErrors, null, 2)}`
        );
      } else {
        const createdOrder = response.orderCreate.order;
        orders.push({ Order: createdOrder.name, ID: createdOrder.id });
        logger.info(`✅ Created order: ${createdOrder.name}`);
      }
    } catch (err) {
      logger.error(`❌ Error creating order: ${err}`);
    }
  }

  if (orders.length) logger.info(orders); // Log orders as a table
  logger.info("🎉 Order generation completed!");
}
