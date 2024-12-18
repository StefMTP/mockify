#!/usr/bin/env node

import { Command } from "commander";
import { promptShopifyCredentials } from "./prompts.js";
import generateOrders from "./commands/generateOrders.js";
import generateProducts from "./commands/generateProducts.js";

const program = new Command();

program
  .name("shopify-data-cli")
  .description("CLI tool for generating dummy Shopify data")
  .version("1.0.0");

// Command to set up Shopify credentials
program
  .command("setup")
  .description("Set up Shopify credentials (store name and access token)")
  .option("--shop <shop>", "Shopify store name")
  .option("--accessToken <accessToken>", "Shopify access token")
  .action((options) => {
    promptShopifyCredentials(options);
  });

// Command to generate dummy products
program
  .command("generate:products")
  .description("Generate dummy products in your Shopify store")
  .option("-n, --number <number>", "Number of products to generate", "10")
  .action((options) => generateProducts(Number(options.number)));

// Command to generate dummy orders
program
  .command("generate:orders")
  .description("Generate dummy orders in your Shopify store")
  .option("-n, --number <number>", "Number of orders to generate", "5")
  .action((options) => generateOrders(Number(options.number)));

program.parse(process.argv);
