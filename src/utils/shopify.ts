import axios, { AxiosInstance } from "axios";
import config from "./config.js";
import logger from "./logger.js";

interface CreateOrderResponse {
  orderCreate: {
    order: {
      id: string;
      name: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export interface CreateOrderInput {
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
}

interface CreateOrderOptions {
  inventoryBehaviour: string;
  sendReceipt: boolean;
}

export interface ProductSetInput {
  title: string;
  descriptionHtml: string;
  productOptions: { name: string; values: { name: string }[] }[];
  productType: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  tags: string[];
  variants: {
    sku: string;
    barcode: string;
    price: string;
    compareAtPrice: string | null;
    inventoryPolicy: "CONTINUE" | "DENY";
    optionValues: { name: string; optionName: string }[];
  }[];
  vendor: string;
}

interface ProductSetResponse {
  productSet: {
    product: {
      id: string;
      title: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export default class ShopifyClient {
  axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: `https://${config.shop}.myshopify.com/admin/api/2024-10/`,
      headers: { "X-Shopify-Access-Token": config.accessToken },
    });
  }

  private async postMethod<TRequest, TResponse>(path: string, data: TRequest): Promise<TResponse> {
    try {
      const response = await this.axiosClient.post<TResponse>(path, data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Specific handling for Axios errors
        logger.error(
          `❌ POST Request to ${path} failed: ${error.message}\nResponse Data: ${JSON.stringify(error.response?.data, null, 2)}`
        );
        throw error; // Re-throw for upstream handling
      }

      // Generic error handling for unknown types
      logger.error(`❌ POST Request to ${path} failed with an unknown error: ${String(error)}`);
      throw new Error("An unexpected error occurred.");
    }
  }

  async graphQLQuery<TResponse, TVariables = Record<string, unknown>>(
    query: string,
    variables?: TVariables
  ): Promise<TResponse> {
    try {
      return await this.postMethod<{ query: string; variables?: TVariables }, TResponse>(
        "graphql.json",
        { query, variables }
      );
    } catch (error) {
      logger.error("❌ GraphQL Query failed.");
      throw error;
    }
  }

  async createOrderMutation(order: CreateOrderInput, options: CreateOrderOptions) {
    const { data, errors } = await this.graphQLQuery<
      { data: CreateOrderResponse; errors?: unknown[] },
      { order: typeof order; options: typeof options }
    >(
      `#graphql
      mutation CreateOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
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

    return data.orderCreate.order;
  }

  async productSetMutation(productSet: ProductSetInput, synchronous: boolean) {
    const { data, errors } = await this.graphQLQuery<
      { data: ProductSetResponse; errors?: unknown[] },
      { synchronous: boolean; productSet: ProductSetInput }
    >(
      `#graphql
      mutation createProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {
        productSet(synchronous: $synchronous, input: $productSet) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }`,
      { synchronous, productSet }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    if (data.productSet.userErrors?.length) {
      throw new Error(JSON.stringify(data.productSet.userErrors, null, 2));
    }

    return data.productSet.product;
  }
}
