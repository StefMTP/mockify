import { input, select } from "@inquirer/prompts";
import throttledQueue from "throttled-queue";
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
    const products: { Product: string; ID: string }[] = [];
    const queue = throttledQueue(2, 1000);

    for (let i = 0; i < count; i++) {
      try {
        await queue(() => {
          const productData = generateProductData(status);
          shopify
            .productSetMutation(productData, true)
            .then(({ product, extensions }) => {
              products.push({ Product: product.title, ID: product.id });
              logger.info(
                `✅ Created product: ${product.title} [Available points: ${extensions?.cost.throttleStatus.currentlyAvailable}]`
              );
            })
            .catch((err) => {
              logger.error(`❌ Error creating product: ${err}`);
            });
        });
      } catch (err) {
        logger.error(`❌ Error creating product: ${err}`);
      }
    }

    if (products.length) logger.info(products);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
