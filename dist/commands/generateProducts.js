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
exports.default = generateProducts;
const shopify_1 = __importDefault(require("../utils/shopify"));
const faker_1 = require("../utils/faker");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../utils/config"));
function generateProducts(count) {
  return __awaiter(this, void 0, void 0, function* () {
    const client = new shopify_1.default();
    const products = [];
    logger_1.default.info(`🚀 Generating ${count} products for shop: ${config_1.default.shop}...`);
    for (let i = 0; i < count; i++) {
      try {
        const productData = (0, faker_1.generateProductData)();
        //TODO: call the shopify client with the proper graphql mutations to create products, options and variants
        //TODO: check for errors and push logs in final data table
      } catch (err) {}
    }
  });
}
