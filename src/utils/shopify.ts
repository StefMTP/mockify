import axios, { AxiosInstance } from "axios";
import config from "./config";
import logger from "./logger";

export default class ShopifyClient {
  axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: `https://${config.shop}.myshopify.com/admin/api/2024-10/`,
      headers: { "X-Shopify-Access-Token": config.accessToken },
    });
  }

  private async postMethod<T>(path: string, data: any) {
    try {
      return await this.axiosClient.post<T>(path, data);
    } catch (error: any) {
      logger.error(`❌ POST Request to ${path} failed: ${error.message}`);
      throw error;
    }
  }

  async graphQLQuery<T>(query: string, variables?: { [key: string]: any }) {
    try {
      return await this.postMethod<T>("graphql.json", { query, variables });
    } catch (error) {
      logger.error("❌ GraphQL Query failed.");
      throw error;
    }
  }

  async createOrderMutation(
    order: {
      email: string;
      tags: string[];
      shippingAddress: {
        address1: string;
        city: string;
        countryCode: string;
        firstName: string;
        lastName: string;
        phone: string;
        zip: string;
      };
      fulfillment: {
        locationId: string;
      };
      shippingLines: {
        title: string;
        priceSet: {
          shopMoney: { amount: string; currencyCode: string };
        };
      }[];
      lineItems: {
        priceSet: {
          shopMoney: { amount: string; currencyCode: string };
        };
        quantity: number;
        requiresShipping: boolean;
        sku: string;
        title: string;
      }[];
      transactions: {
        kind: string;
        status: string;
        amountSet: {
          shopMoney: { amount: string; currencyCode: string };
        };
        gateway: string;
      }[];
    },
    options: {
      inventoryBehaviour: string;
      sendReceipt: boolean;
    }
  ) {
    const {
      data: { extensions, errors, data },
    } = await this.graphQLQuery<{
      data: {
        orderCreate: {
          userErrors: {
            [key: string]: string | string[] | { [key: string]: string }[];
          }[];
          order: {
            id: string;
            name: string;
          };
        };
      };
      extensions: {
        cost: { throttleStatus: { currentlyAvailable: number } };
      };
      errors?: {
        [key: string]: string | string[] | { [key: string]: string }[];
      }[];
    }>(
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

    if (data.orderCreate.userErrors?.length) {
      throw new Error(JSON.stringify(data.orderCreate.userErrors, null, 2));
    }

    return data;
  }
}
