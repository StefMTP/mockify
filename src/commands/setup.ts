import { input } from "@inquirer/prompts";
import config from "../utils/config.js";
import logger from "../utils/logger.js";

export async function setup(args: { shop?: string; accessToken?: string }) {
  try {
    const shop =
      args.shop ||
      (await input({
        message: "Enter your Shopify store name:",
        default: args.shop || config.shop || undefined,
      }));
    const accessToken =
      args.accessToken ||
      (await input({
        message: "Enter your Shopify access token:",
        default: args.accessToken || config.accessToken || undefined,
      }));

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
