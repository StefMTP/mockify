import { input, select } from "@inquirer/prompts";
import PQueue from "p-queue";
import ShopifyClient from "../utils/shopify.js";
import { generateProductData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import { ProductStatus } from "../types/admin.types.js";
import { validateCount } from "../utils/helpers.js";

export default async function generateProducts(args: { count?: number; status?: ProductStatus }) {
  try {
    const count =
      args.count ||
      +(await input({
        message: "How many products would you like to generate?",
        validate: (input: string) =>
          validateCount(parseInt(input, 10)) || "Please enter a valid positive number.",
      }));
    const status =
      args.status ||
      (await select<ProductStatus>({
        message: "What status should the products have?",
        choices: Object.values(ProductStatus),
        default: "DRAFT",
      }));

    logger.info(
      `🚀 Generating ${count} products (with status ${status}) for Shopify store: ${config.shop}...`
    );

    const shopify = new ShopifyClient();
    logger.info("Created Shopify client");

    const products: { Product: string; ID: string }[] = [];

    // Create a PQueue instance with concurrency = 1 and delay of 2 seconds
    const queue = new PQueue({
      concurrency: 1,
      interval: 2000, // Time in ms between tasks
      intervalCap: 1, // Limit tasks per interval
    });

    for (let i = 0; i < count; i++) {
      queue.add(async () => {
        try {
          logger.info(`Creating product ${i + 1}/${count}...`);
          const productData = generateProductData(status);
          const { product, extensions } = await shopify.productSetMutation(productData, true);
          products.push({ Product: product.title, ID: product.id });
          logger.info(
            `✅ Created product: ${product.title} [Available points: ${extensions?.cost.throttleStatus.currentlyAvailable}]`
          );
        } catch (err) {
          logger.error(`❌ Error creating product ${i + 1}: ${err}`);
        }
      });
    }

    // Wait for the queue to finish processing
    await queue.onIdle();

    if (products.length) logger.info(products);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
