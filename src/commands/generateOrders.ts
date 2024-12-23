import ShopifyClient from "../utils/shopify.js";
import inquirer from "inquirer";
import { generateOrderData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import throttledQueue from "throttled-queue";

interface OrderGenerationOptions {
  count: number;
  variants: boolean;
}

export default async function generateOrders(options: { count?: number; variants?: boolean }) {
  try {
    const queue = throttledQueue(2, 1000);

    const answers = await inquirer.prompt<OrderGenerationOptions>([
      {
        type: "input",
        name: "count",
        message: "How many orders would you like to generate?",
        validate: (input: string) => {
          const num = parseInt(input, 10);
          if (isNaN(num) || num <= 0) {
            return "Please enter a valid positive number.";
          }
          return true;
        },
        when: !options?.count,
      },
      {
        type: "confirm",
        name: "variants",
        message: "Do you want to use your store's product variants?",
        when: !options?.variants,
      },
    ]);

    const count = options.count || answers.count;
    const useVariants = options.variants || answers.variants;

    logger.info(`🚀 Generating ${count} orders for shop: ${config.shop}...`);

    const shopify = new ShopifyClient();
    let productVariants: {
      id: string;
      price: string;
      compareAtPrice: string | null;
    }[] = [];
    const locations = await shopify.getLocations();
    const paymentMethods = Array.from(
      new Set(
        (await shopify.getTranslatableResources("PAYMENT_GATEWAY")).map((method) => method.value)
      )
    );
    const shippingMethods = Array.from(
      new Set(
        (await shopify.getTranslatableResources("DELIVERY_METHOD_DEFINITION")).map(
          (method) => method.value
        )
      )
    );

    if (useVariants) {
      productVariants = await shopify.getAllProductVariants();
    }

    const orders: { Order: string; ID: string }[] = [];
    let remainingCount = count;

    const intervalId = setInterval(() => {
      if (remainingCount <= 0) {
        clearInterval(intervalId);
        logger.info("🎉 Order generation completed!");
        if (orders.length) logger.info(orders);
        return;
      }

      const batchCount = Math.min(4, remainingCount);
      remainingCount -= batchCount;

      queue(() => {
        for (let i = 0; i < batchCount; i++) {
          try {
            const orderData = generateOrderData(
              locations,
              shippingMethods,
              paymentMethods,
              productVariants
            );
            shopify
              .createOrderMutation(orderData, {
                inventoryBehaviour: "BYPASS",
                sendReceipt: false,
              })
              .then((order) => {
                orders.push({ Order: order.name, ID: order.id });
                logger.info(`✅ Created order: ${order.name}`);
              });
          } catch (err) {
            logger.error(`❌ Error creating order: ${err}`);
          }
        }
      });
    }, 60 * 1000);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
      logger.error(error.stack);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
