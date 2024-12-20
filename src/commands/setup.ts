import inquirer from "inquirer";
import config from "../utils/config.js";
import logger from "../utils/logger.js";

// Define the type for answers explicitly
interface ShopifyCredentials {
  shop: string;
  accessToken: string;
}

export async function setup(args: { shop?: string; accessToken?: string }) {
  try {
    // If arguments are passed, use them; otherwise, prompt the user
    const answers = await inquirer.prompt<ShopifyCredentials>([
      {
        type: "input",
        name: "shop",
        message: "Enter your Shopify store name:",
        default: args.shop || config.shop || undefined,
        when: !args.shop, // Skip prompt if shop is provided as an argument
      },
      {
        type: "input",
        name: "accessToken",
        message: "Enter your Shopify access token:",
        default: args.accessToken || config.accessToken || undefined,
        when: !args.accessToken, // Skip prompt if accessToken is provided as an argument
      },
    ]);

    // Merge arguments and prompted answers
    const shop = args.shop || answers.shop;
    const accessToken = args.accessToken || answers.accessToken;

    // Update the .env file dynamically with the provided values
    if (shop) config.updateEnv("SHOP", shop);
    if (accessToken) config.updateEnv("ACCESS_TOKEN", accessToken);

    logger.info("✅ Shopify credentials saved successfully!");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Failed to save Shopify credentials: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
