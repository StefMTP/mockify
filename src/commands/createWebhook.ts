import { select, input } from "@inquirer/prompts";
import ShopifyClient from "../utils/shopify.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import { WebhookSubscriptionTopic } from "../types/admin.types.js";

export default async function createWebhook(args: { topic?: WebhookSubscriptionTopic }) {
  try {
    const topic =
      args.topic ||
      (await select<WebhookSubscriptionTopic>({
        message: "What topic should the webhook listen to?",
        choices: Object.values(WebhookSubscriptionTopic),
      }));
    const webhookUrl = await input({
      message: "What is the URL for the webhook?",
      validate: (input: string) => {
        try {
          const url = new URL(input);
          return /^(https?:\/\/)/.test(url.protocol);
        } catch {
          return false;
        }
      },
    });

    logger.info(
      `🚀 Creating webhook on topic ${topic} (webhook URL: ${webhookUrl}) for Shopify store: ${config.shop}...`
    );

    const shopify = new ShopifyClient();
    const webhook = await shopify.webhookCreateMutation(topic, webhookUrl);

    logger.info(`✅ Webhook created successfully with ID: ${webhook.id}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Command failure: ${error.message}`);
    } else {
      logger.error("❌ An unknown error occurred during the prompt.");
    }
  }
}
