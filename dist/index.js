"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const prompts_1 = require("./prompts");
const generateProducts_1 = __importDefault(require("./commands/generateProducts"));
const generateOrders_1 = __importDefault(require("./commands/generateOrders"));
const program = new commander_1.Command();
program
  .name("shopify-data-cli")
  .description("CLI tool for generating dummy Shopify data")
  .version("1.0.0");
program
  .command("setup")
  .description("Set up Shopify credentials")
  .action(prompts_1.promptShopifyCredentials);
program
  .command("generate:products")
  .description("Generate dummy products")
  .option("-n, --number <number>", "Number of products to generate", "10")
  .action((options) => (0, generateProducts_1.default)(Number(options.number)));
program
  .command("generate:orders")
  .description("Generate dummy orders")
  .option("-n, --number <number>", "Number of orders to generate", "5")
  .action((options) => (0, generateOrders_1.default)(Number(options.number)));
program.parse(process.argv);
