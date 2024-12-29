#!/usr/bin/env node

import { Command } from "commander";
import { setup } from "./commands/setup.js";
import generateOrders from "./commands/generateOrders.js";
import generateProducts from "./commands/generateProducts.js";
import createWebhook from "./commands/createWebhook.js";
import { ProductStatus, WebhookSubscriptionTopic } from "./types/admin.types.js";
import logger from "./utils/logger.js";

const validateCount = (count: number) => Number.isInteger(count) && count > 0;

function validateStatus(status: string): status is ProductStatus {
  return (Object.values(ProductStatus) as string[]).includes(status);
}

const program = new Command();

program
  .name("mockify")
  .description("CLI tool for generating mock data on your Shopify store")
  .usage("[command] [options]")
  .version("1.0.0");

// Command to set up Shopify credentials
program
  .command("setup")
  .description("Set up Shopify credentials (store name and access token)")
  .option("--shop <shop>", "Shopify store name")
  .option("--accessToken <accessToken>", "Shopify access token")
  .action(setup);

// Command to generate dummy products
program
  .command("generate:products")
  .description("Generate dummy products in your Shopify store")
  .option("-c, --count <count>", "Number of products to generate")
  .option("-s, --status <status>", "Status of the products (ACTIVE, DRAFT, ARCHIVED)")
  .action(async (options) => {
    const { count, status } = options;
    if (count && !validateCount(parseInt(count, 10))) {
      logger.error("❌ Please enter a valid positive number for the count.");
      process.exit(1);
    }
    if (status && !validateStatus(status)) {
      logger.error("❌ Please enter a valid status (ACTIVE, DRAFT, ARCHIVED).");
      process.exit(1);
    }
    await generateProducts({
      count: options.count ? parseInt(options.count, 10) : undefined,
      status: options.status,
    });
  });

// Command to generate dummy orders
program
  .command("generate:orders")
  .description("Generate dummy orders in your Shopify store")
  .option("-c, --count <count>", "Number of orders to generate")
  .option("-v, --variants", "Use your store's product variants")
  .action(async (options) => {
    const { count, variants } = options;
    if (count && !validateCount(parseInt(count, 10))) {
      logger.error("❌ Please enter a valid positive number for the count.");
      process.exit(1);
    }
    await generateOrders({
      count: options.count ? parseInt(options.count, 10) : undefined,
      variants,
    });
  });

// Command to create webhook subscription
program
  .command("create:webhook")
  .description("Create a webhook subscription for a certain topic")
  .option("-t, --topic <topic>", "Webhook topic")
  .action(async (options) => {
    const { topic } = options;
    if (topic && Object.values(WebhookSubscriptionTopic).includes(topic)) {
      logger.error("❌ Please provide a webhook topic.");
      process.exit(1);
    }
    await createWebhook(topic);
  });

program.parse(process.argv);
