import inquirer from "inquirer";
import ShopifyClient from "../utils/shopify.js";
import { generateProductData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import { productStatus } from "../utils/types.js";

interface ProductGenerationOptions {
  count: number;
  status: keyof typeof productStatus;
}

export default async function generateProducts(options: {
  count?: number;
  status?: keyof typeof productStatus;
}) {
  try {
    // If arguments are passed, use them; otherwise, prompt the user
    const answers = await inquirer.prompt<ProductGenerationOptions>([
      {
        type: "input",
        name: "count",
        message: "How many products would you like to generate?",
        validate: (input: string) => {
          const num = parseInt(input, 10);
          if (isNaN(num) || num <= 0) {
            return "Please enter a valid positive number.";
          }
          return true;
        },
        when: !options?.count, // Skip prompt if count is provided as an argument
      },
      {
        type: "list",
        name: "status",
        message: "What status should the products have?",
        choices: Object.values(productStatus),
        default: "DRAFT",
        when: !options?.status, // Skip prompt if status is provided as an argument
      },
    ]);

    const count = options.count || answers.count;
    const status = options.status || answers.status;

    logger.info(
      `🚀 Generating ${count} products (with status ${status}) for Shopify store: ${config.shop}...`
    );

    const shopify = new ShopifyClient();
    const products = [];

    for (let i = 0; i < count; i++) {
      try {
        const productData = generateProductData(status);
        const product = await shopify.productSetMutation(productData, true);
        products.push({ Product: product.title, ID: product.id });
        logger.info(`✅ Created product: ${product.title}`);
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
