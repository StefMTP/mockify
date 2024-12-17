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
exports.default = generateOrders;
const shopify_1 = __importDefault(require("../utils/shopify"));
const faker_1 = require("../utils/faker");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../utils/config"));
function generateOrders(count) {
  return __awaiter(this, void 0, void 0, function* () {
    var _a, _b, _c;
    const shopify = new shopify_1.default();
    const orders = [];
    logger_1.default.info(`🚀 Generating ${count} orders for shop: ${config_1.default.shop}...`);
    for (let i = 0; i < count; i++) {
      try {
        const orderData = (0, faker_1.generateOrderData)();
        const response = yield shopify.createOrderMutation(orderData, {
          inventoryBehaviour: "BYPASS",
          sendReceipt: false,
        });
        if (
          (_b =
            (_a = response === null || response === void 0 ? void 0 : response.orderCreate) ===
              null || _a === void 0
              ? void 0
              : _a.userErrors) === null || _b === void 0
            ? void 0
            : _b.length
        ) {
          logger_1.default.error(
            `❌ Failed to create order: ${JSON.stringify((_c = response === null || response === void 0 ? void 0 : response.orderCreate) === null || _c === void 0 ? void 0 : _c.userErrors, null, 2)}`
          );
        } else {
          const createdOrder = response.orderCreate.order;
          orders.push({ Order: createdOrder.name, ID: createdOrder.id });
          logger_1.default.info(`✅ Created order: ${createdOrder.name}`);
        }
      } catch (err) {
        logger_1.default.error(`❌ Error creating order: ${err}`);
      }
    }
    if (orders.length) logger_1.default.info(orders); // Log orders as a table
    logger_1.default.info("🎉 Order generation completed!");
  });
}
