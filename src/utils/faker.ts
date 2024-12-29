import { faker } from "@faker-js/faker";
import { CreateOrderInput, ProductSetInput, productStatus } from "./types.js";

const generateRandomMPN = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  const symbols = "-/".split("");

  let mpn = "";

  // Generate the first character (only letters or numbers, no symbols)
  mpn += faker.helpers.arrayElement(characters);

  // Generate 5 middle characters (letters, numbers, or symbols)
  for (let i = 0; i < 5; i++) {
    const isSymbol = faker.datatype.boolean(); // Randomly decide if this character is a symbol
    mpn += isSymbol ? faker.helpers.arrayElement(symbols) : faker.helpers.arrayElement(characters);
  }

  // Generate the last character (only letters or numbers, no symbols)
  mpn += faker.helpers.arrayElement(characters);

  return mpn;
};

const generateRandomBarcode = () => {
  let barcode = "";
  for (let i = 0; i < 13; i++) {
    barcode += faker.number.int({ min: 0, max: 9 }).toString();
  }
  return barcode;
};

const createProductTags = (count: number) => {
  const tags = new Set<string>();
  const sources = [
    faker.color.human,
    faker.commerce.productMaterial,
    faker.commerce.productAdjective,
    faker.company.buzzAdjective,
    faker.company.catchPhraseAdjective,
  ];
  while (tags.size < count) {
    tags.add(sources[faker.number.int({ min: 0, max: sources.length - 1 })]());
  }
  return Array.from(tags);
};

function generatePrices() {
  // Generate a final price as a random float between 5 and 100, fixed to 2 decimals
  const finalPrice = faker.commerce.price({ min: 5, max: 100, dec: 2 });

  // Randomly decide whether to generate a starting price
  const hasStartingPrice = faker.datatype.boolean();

  if (hasStartingPrice) {
    // Generate a starting price that is higher than the final price
    const startingPrice = faker.commerce.price({
      min: parseFloat(finalPrice) + 1,
      max: parseFloat(finalPrice) + 50,
      dec: 2,
    });

    return { finalPrice, startingPrice };
  }

  // Return only the final price if no starting price is generated
  return { finalPrice, startingPrice: null };
}

function generateProductOptions(): { name: string; values: { name: string }[] }[] {
  // Define available options and their respective value generators
  const optionsGenerators: Record<"size" | "color" | "material", () => string> = {
    size: () => faker.helpers.arrayElement(["Small", "Medium", "Large", "Extra Large"]),
    color: () => faker.color.human(),
    material: () => faker.commerce.productMaterial(),
  };

  // Randomly decide which options to include
  const selectedOptions = Object.keys(optionsGenerators) as (keyof typeof optionsGenerators)[];

  // Generate the product options in the required format
  const productOptions = selectedOptions
    .filter(() => faker.datatype.boolean()) // Randomly include or exclude options
    .map((option) => {
      // Generate random number of values (between 2 and 5)
      const valuesCount = faker.number.int({ min: 2, max: 5 });

      // Generate unique values using a Set
      const uniqueValuesSet = new Set<string>();
      while (uniqueValuesSet.size < valuesCount) {
        uniqueValuesSet.add(optionsGenerators[option]());
      }

      // Convert unique values into the required format
      const values = Array.from(uniqueValuesSet).map((value) => ({ name: value }));

      return { name: option, values };
    });

  // Return the fixed static array if productOptions is empty
  if (productOptions.length === 0) {
    return [
      {
        name: "Title",
        values: [{ name: "Default Title" }],
      },
    ];
  }

  return productOptions;
}

const generateVariants = (options: { name: string; values: { name: string }[] }[]) => {
  // Helper to recursively generate combinations
  const combine = (
    remainingOptions: { name: string; values: { name: string }[] }[],
    currentCombination: { name: string; optionName: string }[]
  ): {
    optionValues: { name: string; optionName: string }[];
    sku: string;
    barcode: string;
    price: string;
    compareAtPrice: string | null;
    inventoryPolicy: "CONTINUE" | "DENY";
  }[] => {
    if (remainingOptions.length === 0) {
      const prices = generatePrices();

      // Base case: no more options to combine, return the current combination with an MPN
      return [
        {
          sku: generateRandomMPN(),
          barcode: generateRandomBarcode(),
          price: prices.finalPrice,
          compareAtPrice: prices.startingPrice,
          inventoryPolicy: "DENY",
          optionValues: currentCombination,
        },
      ];
    }

    // Take the first option and iterate over its values
    const [currentOption, ...restOptions] = remainingOptions;

    return currentOption.values.flatMap((value) =>
      combine(restOptions, [
        ...currentCombination,
        { name: value.name, optionName: currentOption.name },
      ])
    );
  };

  // Start the recursive combination generation
  return combine(options, []);
};

const createLineItemsFromVariants = (
  variants: { id: string; price: string; compareAtPrice: string | null }[]
) => {
  const selectedVariants = faker.helpers.arrayElements(
    variants,
    faker.number.int({ min: 1, max: 5 })
  );
  return selectedVariants.map((variant) => ({
    variantId: variant.id,
    priceSet: {
      shopMoney: {
        amount: variant.price,
        currencyCode: "EUR",
      },
    },
    quantity: faker.number.int({ min: 1, max: 3 }),
    requiresShipping: faker.number.float({ min: 0, max: 1 }) >= 0.95 ? false : true,
  }));
};

const createLineItem = () => {
  return {
    priceSet: {
      shopMoney: {
        amount: faker.commerce.price({ min: 20, max: 1500 }),
        currencyCode: "EUR",
      },
    },
    quantity: faker.number.int({ min: 1, max: 3 }),
    requiresShipping: faker.number.float({ min: 0, max: 1 }) >= 0.95 ? false : true,
    sku: generateRandomMPN(),
    title: faker.commerce.productName(),
  };
};

export const generateProductData = (status: keyof typeof productStatus): ProductSetInput => {
  const productOptions = generateProductOptions();
  const variants = generateVariants(productOptions);
  return {
    title: faker.commerce.productName(),
    descriptionHtml: faker.commerce.productDescription(),
    productType: faker.commerce.department(),
    tags: createProductTags(faker.number.int({ min: 1, max: 5 })),
    vendor: faker.company.name(),
    status,
    productOptions,
    variants,
  };
};

export const generateOrderData = (
  shippingLines: string[],
  paymentMethods: string[],
  variants?: { id: string; price: string; compareAtPrice: string | null }[]
): CreateOrderInput => {
  const shippingLine = shippingLines[faker.number.int({ min: 0, max: 4 })];
  const shippingLinePrice = faker.commerce.price({ min: 0, max: 12 });
  const paymentMethod = paymentMethods[faker.number.int({ min: 0, max: 4 })];
  const lineItems = variants?.length
    ? createLineItemsFromVariants(variants)
    : faker.helpers.multiple(createLineItem, {
        count: faker.number.int({ min: 1, max: 5 }),
      });
  return {
    email: faker.internet.email(),
    shippingAddress: {
      address1: faker.location.streetAddress(),
      city: faker.location.city(),
      countryCode: faker.location.countryCode(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      zip: faker.location.zipCode(),
    },
    shippingLines: [
      {
        title: shippingLine,
        priceSet: {
          shopMoney: { amount: shippingLinePrice, currencyCode: "EUR" },
        },
      },
    ],
    lineItems,
    transactions: [
      {
        kind: "SALE",
        status: faker.helpers.arrayElement(["SUCCESS", "PENDING"]),
        amountSet: {
          shopMoney: {
            amount: (
              lineItems.reduce(
                (sum, item) => sum + +item.priceSet.shopMoney.amount * item.quantity,
                0
              ) + +shippingLinePrice
            ).toFixed(2),
            currencyCode: "EUR",
          },
        },
        gateway: paymentMethod,
      },
    ],
  };
};
