import throttledQueue from "throttled-queue";
import inquirer from "inquirer";
import ShopifyClient from "../utils/shopify.js";
import { generateOrderData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import {
  OrderCreateInputsInventoryBehavior,
  ProductVariant,
  TranslatableResourceType,
} from "../types/admin.types.js";

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
    let productVariants: Pick<ProductVariant, "id" | "price" | "compareAtPrice">[] = [];
    const paymentMethods = Array.from(
      new Set(
        (await shopify.getTranslatableResources(TranslatableResourceType.PaymentGateway)).map(
          (method) => method.value
        )
      )
    );
    const shippingMethods = Array.from(
      new Set(
        (await shopify.getTranslatableResources(TranslatableResourceType.DeliveryMethodDefinition))
          .filter(Boolean)
          .map((method) => method.value)
      )
    );

    if (useVariants) {
      productVariants = await shopify.getAllProductVariants();
    }

    const orders: { Order: string; ID: string }[] = [];
    let remainingCount = count;

    const generateBatch = async () => {
      const batchCount = Math.min(4, remainingCount);
      remainingCount -= batchCount;

      for (let i = 0; i < batchCount; i++) {
        try {
          await queue(() => {
            const orderData = generateOrderData(shippingMethods, paymentMethods, productVariants);
            shopify
              .createOrderMutation(orderData, {
                inventoryBehaviour: OrderCreateInputsInventoryBehavior.Bypass,
                sendReceipt: false,
              })
              .then(({ order, extensions }) => {
                orders.push({ Order: order.name, ID: order.id });
                logger.info(
                  `✅ Created order: ${order.name} [${extensions?.cost.throttleStatus.currentlyAvailable} points remaining]`
                );
              })
              .catch((err) => {
                logger.error(`❌ Error creating order: ${err}`);
              });
          });
        } catch (err) {
          logger.error(`❌ Error creating order: ${err}`);
        }
      }

      if (remainingCount <= 0) {
        logger.info("🎉 Order generation completed!");
        if (orders.length) logger.info(orders);
        clearInterval(intervalId);
      }
    };

    // Run the first batch immediately
    await generateBatch();

    const intervalId = setInterval(generateBatch, 60 * 1000);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
      logger.error(error.stack);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
