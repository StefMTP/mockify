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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
class ShopifyClient {
  constructor() {
    this.axiosClient = axios_1.default.create({
      baseURL: `https://${config_1.default.shop}.myshopify.com/admin/api/2024-10/`,
      headers: { "X-Shopify-Access-Token": config_1.default.accessToken },
    });
  }
  postMethod(path, data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        return yield this.axiosClient.post(path, data);
      } catch (error) {
        logger_1.default.error(`❌ POST Request to ${path} failed: ${error.message}`);
        throw error;
      }
    });
  }
  graphQLQuery(query, variables) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        return yield this.postMethod("graphql.json", { query, variables });
      } catch (error) {
        logger_1.default.error("❌ GraphQL Query failed.");
        throw error;
      }
    });
  }
  createOrderMutation(order, options) {
    return __awaiter(this, void 0, void 0, function* () {
      var _a;
      const {
        data: { extensions, errors, data },
      } = yield this.graphQLQuery(
        `mutation CreateOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
        orderCreate(order: $order, options: $options) {
          userErrors {
            field
            message
          }
          order {
            id
            name
          }
        }
      }`,
        { order, options }
      );
      if (errors) {
        throw new Error(JSON.stringify(errors, null, 2));
      }
      if ((_a = data.orderCreate.userErrors) === null || _a === void 0 ? void 0 : _a.length) {
        throw new Error(JSON.stringify(data.orderCreate.userErrors, null, 2));
      }
      return data;
    });
  }
}
exports.default = ShopifyClient;
