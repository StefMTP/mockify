import ShopifyClient from "../utils/shopify.js";
import { generateProductData } from "../utils/faker.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import inquirer from "inquirer";

interface ProductGenerationOptions {
  count: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
}

export default async function generateProducts(options: { count?: number; status?: string }) {
  const shopify = new ShopifyClient();
  const products = [];

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
      when: !options?.count,
    },
    {
      type: "list",
      name: "status",
      message: "What status should the products have?",
      choices: ["ACTIVE", "DRAFT", "ARCHIVED"],
      default: "DRAFT",
      when: !options?.status,
    },
  ]);

  const count = options.count || answers.count;
  const status = (options.status || answers.status) as "ACTIVE" | "ARCHIVED" | "DRAFT";

  logger.info(
    `🚀 Generating ${count} products (with status ${status}) for Shopify store: ${config.shop}...`
  );

  for (let i = 0; i < count; i++) {
    try {
      const productData = generateProductData(status);
      logger.info(productData);
      const product = await shopify.productSetMutation(productData, true);
      products.push({ Product: product.title, ID: product.id });
      logger.info(`✅ Created product: ${product.title}`);
    } catch (err) {
      logger.error(`❌ Error creating product: ${err}`);
    }
  }
}
