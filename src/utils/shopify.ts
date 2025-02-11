import { AdminApiClient, createAdminApiClient } from "@shopify/admin-api-client";
import config from "./config.js";
import {
  Image,
  InventoryItem,
  Maybe,
  OrderCreateOptionsInput,
  OrderCreateOrderInput,
  Product,
  ProductOption,
  ProductSetInput,
  ProductVariant,
  SelectedOption,
  TranslatableResourceType,
  WebhookSubscriptionFormat,
  WebhookSubscriptionTopic,
  Weight,
} from "../types/admin.types.js";
import axios from "axios";
import logger from "./logger.js";

export default class ShopifyClient {
  client: AdminApiClient;

  constructor() {
    this.client = createAdminApiClient({
      storeDomain: `${config.shop}.myshopify.com`,
      apiVersion: "2024-10",
      accessToken: config.accessToken,
    });
  }

  async getLocations() {
    const { data, errors } = await this.client.request(`#graphql
      query GetLocations {
        locations(first: 10) {
          nodes {
            id
            name
          }
        }
      }`);

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data!.locations.nodes;
  }

  async getTranslatableResources(resourceType: TranslatableResourceType) {
    const { data, errors } = await this.client.request(
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
      { variables: { resourceType } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data!.translatableResources.nodes.flatMap((node) =>
      node.translatableContent.filter((content) => content.key == "name" && content.value)
    );
  }

  async createOrderMutation(order: OrderCreateOrderInput, options: OrderCreateOptionsInput) {
    const { data, errors, extensions } = await this.client.request(
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
      { variables: { order, options } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.orderCreate) {
      throw new Error("No data returned from orderCreate mutation");
    }
    if (data.orderCreate.userErrors?.length) {
      throw new Error(JSON.stringify(data.orderCreate.userErrors, null, 2));
    }

    return { order: data.orderCreate.order!, extensions };
  }

  async productSetMutation(productSet: ProductSetInput, synchronous: boolean) {
    const { data, errors, extensions } = await this.client.request(
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
      { variables: { synchronous, productSet } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.productSet) {
      throw new Error("No data returned from productSet mutation");
    }
    if (data.productSet.userErrors?.length) {
      throw new Error(JSON.stringify(data.productSet.userErrors, null, 2));
    }

    return { product: data.productSet.product!, extensions };
  }

  async getProductVariants(cursor: Maybe<string> | undefined) {
    const { data, errors } = await this.client.request(
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
      { variables: { cursor } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data!.productVariants;
  }

  async getProductsRest() {
    let hasNextPage = true;
    let link = `https://${config.shop}.myshopify.com/admin/api/2025-01/products.json?limit=250`;
    let products: unknown[] = [];

    while (hasNextPage) {
      const res = await axios.get(link, {
        headers: { "X-Shopify-Access-Token": config.accessToken },
      });
      products = [...products, ...res.data.products];
      // Leaky Bucket rate limiter: 40 requests per shop per app (2r/s drain rate)
      const calls = parseInt(res.headers["x-shopify-shop-api-call-limit"].split("/")[0]);
      if (calls >= 39) {
        logger.info("Call limit reached, sleeping for 2 seconds");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds (4 requests)
      }
      if (res.headers.link?.includes('rel="next"')) {
        link = res.headers.link.split(/<|>/g).splice(-2, 1)[0];
      } else {
        hasNextPage = false;
      }
    }
    return products;
  }

  async getProducts(cursor: Maybe<string> | undefined) {
    const { data, errors, extensions } = await this.client.request(
      `#graphql
        query GetProducts($cursor: String) {
        products(first: 250, after: $cursor) {
          nodes {
            id
            title
            featuredMedia {
              ... on MediaImage {
               image {
                url
                id
               }
              }
            }
            productType
            vendor
            description
            tags
            handle
            options {
              name
              values
            }
            variants (first: 100) {
                nodes {
                    id
                    price
                    compareAtPrice
                    sku
                    barcode
                    image {
                        id
                        url
                    }
                    selectedOptions {
                        name
                        value
                    }
                    inventoryQuantity
                    inventoryPolicy
                    inventoryItem {
                        measurement {
                            weight {
                                unit
                                value
                            }
                        }
                        tracked
                    }
                }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
    }
}
      `,
      { variables: { cursor } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return { products: data!.products, extensions };
  }

  async getAllProductVariants() {
    let cursor: Maybe<string> | undefined = null;
    let hasNextPage = true;
    let allVariants: Pick<ProductVariant, "id" | "price" | "compareAtPrice">[] = [];

    while (hasNextPage) {
      const { nodes, pageInfo } = await this.getProductVariants(cursor);
      allVariants = allVariants.concat(nodes);
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    return allVariants;
  }

  async getAllProducts() {
    let cursor: Maybe<string> | undefined = null;
    let hasNextPage = true;
    let allProducts: (Pick<
      Product,
      "id" | "tags" | "handle" | "productType" | "title" | "vendor" | "description"
    > & {
      featuredMedia?: Maybe<{
        image?: Maybe<Pick<Image, "url" | "id">>;
      }>;
      options: Array<Pick<ProductOption, "name" | "values">>;
      variants: {
        nodes: Array<
          Pick<
            ProductVariant,
            | "id"
            | "price"
            | "compareAtPrice"
            | "sku"
            | "barcode"
            | "inventoryQuantity"
            | "inventoryPolicy"
          > & {
            image?: Maybe<Pick<Image, "id" | "url">>;
            selectedOptions: Array<Pick<SelectedOption, "name" | "value">>;
            inventoryItem: Pick<InventoryItem, "tracked"> & {
              measurement: {
                weight?: Maybe<Pick<Weight, "unit" | "value">>;
              };
            };
          }
        >;
      };
    })[] = [];

    while (hasNextPage) {
      const {
        products: { nodes, pageInfo },
        extensions,
      } = await this.getProducts(cursor);

      allProducts = allProducts.concat(nodes);
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
      // Rate limit logic
      const throttleStatus = extensions!.cost.throttleStatus;
      const currentlyAvailable = throttleStatus.currentlyAvailable;
      const restoreRate = throttleStatus.restoreRate;

      // If the available capacity is low, wait for it to restore
      if (currentlyAvailable < 585) {
        const waitTime = Math.ceil((585 - currentlyAvailable) / restoreRate) * 1000; // Calculate wait time in milliseconds
        console.info(`Rate limit reached, waiting for ${waitTime / 1000} seconds`);
        await new Promise((resolve) => setTimeout(resolve, waitTime)); // Wait for the calculated time
      }
    }
    return allProducts;
  }

  async bulkOperationRunQuery(query: string) {
    const { data, errors } = await this.client.request(
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
      { variables: { query } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.bulkOperationRunQuery) {
      throw new Error("No data returned from bulkOperationRunQuery mutation");
    }

    if (data.bulkOperationRunQuery.userErrors?.length) {
      throw new Error(JSON.stringify(data.bulkOperationRunQuery.userErrors, null, 2));
    }

    return data.bulkOperationRunQuery.bulkOperation!.id;
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

  async webhookCreateMutation(topic: WebhookSubscriptionTopic, callbackUrl: string) {
    const { data, errors } = await this.client.request(
      `#graphql
      mutation createWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
          }
        }
      }`,
      {
        variables: {
          topic,
          webhookSubscription: { callbackUrl, format: WebhookSubscriptionFormat.Json },
        },
      }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.webhookSubscriptionCreate) {
      throw new Error("No data returned from webhookSubscriptionCreate mutation");
    }

    return data.webhookSubscriptionCreate.webhookSubscription!;
  }
}
