import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.ts"], // Apply ESLint to all TypeScript files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // General rules
      "no-console": "off", // Allow console logs (for CLI apps)
      semi: ["error", "always"], // Enforce semicolons,
      quotes: ["error", "double", { avoidEscape: true }], // Enforce double quotes, allow single quotes to avoid escaping
    },
  },
];
