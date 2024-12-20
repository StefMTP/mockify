#!/usr/bin/env node

import { Command } from "commander";
import { setup } from "./commands/setup.js";
import generateOrders from "./commands/generateOrders.js";
import generateProducts from "./commands/generateProducts.js";

const program = new Command();

program
  .name("mockify")
  .description("CLI tool for generating mock data on your Shopify store")
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
  .option("-s, --status <status>", 'Status of the products ("ACTIVE", "DRAFT", "ARCHIVED")')
  .action(async (options) => {
    await generateProducts({
      count: options.count ? parseInt(options.count, 10) : undefined,
      status: options.status,
    });
  });

// Command to generate dummy orders
program
  .command("generate:orders")
  .description("Generate dummy orders in your Shopify store")
  .option("-n, --number <number>", "Number of orders to generate", "1")
  .action((options) => generateOrders(Number(options.number)));

program.parse(process.argv);
