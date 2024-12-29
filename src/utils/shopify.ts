import axios, { AxiosInstance } from "axios";
import config from "./config.js";
import logger from "./logger.js";
import {
  BulkOperationRunQueryResponse,
  CreateOrderInput,
  CreateOrderOptions,
  CreateOrderResponse,
  ProductSetInput,
  ProductSetResponse,
  ProductVariant,
  WebhookCreateMutationResponse,
} from "./types.js";

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

  async getLocations() {
    const { data, errors } = await this.graphQLQuery<{
      data: { locations: { nodes: { id: string; name: string }[] } };
      errors?: unknown[];
    }>(
      `#graphql
      query GetLocations {
        locations(first: 10) {
          nodes {
            id
            name
          }
        }
      }`
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data.locations.nodes;
  }

  async getTranslatableResources(resourceType: string) {
    const { data, errors } = await this.graphQLQuery<{
      data: {
        translatableResources: {
          nodes: { translatableContent: { key: string; value: string }[] }[];
        };
      };
      errors?: unknown[];
    }>(
      `#graphql
      query GetTranslatableResources($resourceType: TranslatableResourceType!) {
        translatableResources(first: 10, resourceType: $resourceType) {
          nodes {
            translatableContent {
              key
              value
            }
          }
        }
     }`,
      { resourceType }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data.translatableResources.nodes.flatMap((node) =>
      node.translatableContent.filter((content) => content.key == "name" && content.value)
    );
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

  async getProductVariants(cursor: string | null) {
    const { data, errors } = await this.graphQLQuery<
      {
        data: {
          productVariants: {
            nodes: ProductVariant[];
            pageInfo: { endCursor: string; hasNextPage: boolean };
          };
        };
        errors?: unknown[];
      },
      { cursor: string | null }
    >(
      `#graphql
      query GetProductVariants($cursor: String) {
        productVariants(first: 250, after: $cursor) {
            nodes {
              id
              price
              compareAtPrice
            }
            pageInfo {
              endCursor
              hasNextPage
            }
        }
      }`,
      { cursor }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data.productVariants;
  }

  async getAllProductVariants() {
    let cursor = null;
    let hasNextPage = true;
    let allVariants: ProductVariant[] = [];

    while (hasNextPage) {
      const { nodes, pageInfo } = await this.getProductVariants(cursor);
      allVariants = allVariants.concat(nodes);
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    return allVariants;
  }

  async bulkOperationRunQuery(query: string) {
    const { data, errors } = await this.graphQLQuery<
      { data: BulkOperationRunQueryResponse; errors?: unknown[] },
      { query: string }
    >(
      `#graphql
      mutation RunBulkOperation($query: String!) {
        bulkOperationRunQuery(
          query: $query
        ) {
          bulkOperation {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      { query }
    );

    if (data.bulkOperationRunQuery.userErrors?.length) {
      throw new Error(JSON.stringify(data.bulkOperationRunQuery.userErrors, null, 2));
    }

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data.bulkOperationRunQuery.bulkOperation.id;
  }

  async bulkOperationProductsQuery() {
    const query = `{
      productVariants {
        edges {
          node {
            id
          }
        }
      }
    }`;

    return await this.bulkOperationRunQuery(query);
  }

  async webhookCreateMutation(topic: string, callbackUrl: string) {
    const { data, errors } = await this.graphQLQuery<
      {
        data: WebhookCreateMutationResponse;
        errors?: unknown[];
      },
      { topic: string; webhookSubscription: { callbackUrl: string; format: string } }
    >(
      `#graphql
      mutation createWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
            userErrors {
              field
              message
            }
          }
        }
      }`,
      { topic, webhookSubscription: { callbackUrl, format: "JSON" } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data.webhookSubscriptionCreate.webhookSubscription.id;
  }
}
