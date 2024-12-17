"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptShopifyCredentials = promptShopifyCredentials;
const inquirer_1 = __importDefault(require("inquirer"));
const config_1 = __importDefault(require("./utils/config"));
const logger_1 = __importDefault(require("./utils/logger"));
function promptShopifyCredentials() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      // Explicitly type the answers using ShopifyCredentials
      const answers = yield inquirer_1.default.prompt([
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
      config_1.default.updateEnv("SHOP", answers.shop);
      config_1.default.updateEnv("ACCESS_TOKEN", answers.accessToken);
      logger_1.default.info("✅ Shopify credentials saved successfully!");
    } catch (error) {
      if (error instanceof Error) {
        logger_1.default.error(`❌ Failed to save Shopify credentials: ${error.message}`);
      } else {
        logger_1.default.error("❌ An unknown error occurred during the prompt.");
      }
    }
  });
}
