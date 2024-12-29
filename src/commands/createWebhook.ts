import inquirer from "inquirer";
import ShopifyClient from "../utils/shopify.js";
import logger from "../utils/logger.js";
import config from "../utils/config.js";
import { WebhookSubscriptionTopic } from "../types/admin.types.js";

interface CreateWebhookOptions {
  topic: WebhookSubscriptionTopic;
  webhookUrl: string;
}

export default async function createWebhook(options: { topic?: WebhookSubscriptionTopic }) {
  try {
    // If arguments are passed, use them; otherwise, prompt the user
    const answers = await inquirer.prompt<CreateWebhookOptions>([
      {
        type: "list",
        name: "topic",
        message: "What topic should the webhook listen to?",
        choices: Object.values(WebhookSubscriptionTopic),
        when: !options?.topic, // Skip prompt if topic is provided as an argument
      },
      {
        type: "input",
        name: "webhookUrl",
        message: "What is the URL for the webhook?",
        validate: (input: string) => {
          try {
            const url = new URL(input);
            return /^(https?:\/\/)/.test(url.protocol);
          } catch {
            return false;
          }
        },
      },
    ]);

    const topic = options.topic || answers.topic;
    const webhookUrl = answers.webhookUrl;

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
