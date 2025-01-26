import throttledQueue from "throttled-queue";
import { input, confirm } from "@inquirer/prompts";
import ShopifyClient from "../utils/shopify.js";
import { generateOrderData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import {
  OrderCreateInputsInventoryBehavior,
  ProductVariant,
  TranslatableResourceType,
} from "../types/admin.types.js";
import { validateCount } from "../utils/helpers.js";

export default async function generateOrders(args: { count?: number; variants?: boolean }) {
  try {
    const count =
      args.count ||
      +(await input({
        message: "How many orders would you like to generate?",
        validate: (input: string) =>
          validateCount(parseInt(input, 10)) || "Please enter a valid positive number.",
      }));
    const useVariants =
      args.variants ||
      (await confirm({ message: "Do you want to use your store's product variants?" }));

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
    const queue = throttledQueue(2, 1000);

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
