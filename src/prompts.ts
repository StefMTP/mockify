import inquirer, { DistinctQuestion } from "inquirer";
import config from "./utils/config";
import logger from "./utils/logger";

// Define the type for answers explicitly
interface ShopifyCredentials {
  shop: string;
  accessToken: string;
}

export async function promptShopifyCredentials() {
  try {
    // Explicitly type the answers using ShopifyCredentials
    const answers = await inquirer.prompt<ShopifyCredentials>([
      {
        type: "input", // Required by Inquirer
        name: "shop", // Key for the response object
        message: "Enter your Shopify store name:",
      },
      {
        type: "input",
        name: "accessToken",
        message: "Enter your Shopify access token:",
      },
    ]);

    // Update environment variables using the config utility
    config.updateEnv("SHOP", answers.shop);
    config.updateEnv("ACCESS_TOKEN", answers.accessToken);

    logger.info("✅ Shopify credentials saved successfully!");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Failed to save Shopify credentials: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
