# 🚀 **Mockify CLI Documentation**

### 📦 **Prerequisites**

- Ensure you're running **Node.js v20+**. You can verify your version with:
  ```bash
  node -v
  ```

---

## 🛠️ **Setup the CLI**

Follow these steps to set up the CLI tool:

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Build the Project:**  
   Compile TypeScript into JavaScript (`dist` folder):

   ```bash
   npm run build
   ```

3. **Link the CLI Globally:**  
   Set up the CLI command `mockify` for global usage:

   ```bash
   npm link
   ```

4. **Verify the Installation:**  
   Run the following to see all available commands:
   ```bash
   mockify
   ```

You can now use `mockify` in any local directory.

---

## 📈 **Expand the CLI**

To add new commands or extend the CLI functionality, follow these steps:

1. **Define the Command in `src/index.ts`:**

   - Use the `program` instance from the **`commander`** package.
   - Add details such as the command name, description, arguments, and options.

   Example:

   ```typescript
   program
     .command("new-command")
     .description("Describe your new command")
     .action(() => {
       newCommand();
       console.log("New command executed!");
     });
   ```

2. **Create a Command File:**

   - Add a new file in `src/commands`.
   - Export a function that handles the command logic.
   - Use **`inquirer`** for interactive prompts if needed.

   Example (`src/commands/newCommand.ts`):

   ```typescript
   export default async function newCommand() {
     console.log("Hello from the new command!");
   }
   ```

3. **Use Utilities from `src/utils`:**

   - **`faker.ts`**: Randomized data generation using **`@faker-js/faker`**.
   - **`logger.ts`**: Logging utilities powered by **`winston`**.
   - **`shopify.ts`**: Shopify Admin API client for queries and mutations.

4. **Rebuild the Project:**  
   After making changes, rebuild the project:

   ```bash
   npm run build
   ```

5. **Test Your Command:**  
   Run your command directly via the CLI:
   ```bash
   mockify new-command
   ```

---

## 📝 **Important Notes**

- **TypeScript Proficiency:**  
   If you're not comfortable with **TypeScript**, take some time to learn the basics. This project relies heavily on TypeScript for safety and clarity.

- **File Imports:**  
   Always include the `.js` extension when importing files in your code:

  ```typescript
  import logger from "./utils/logger.js";
  ```

- **Shebang Line:**  
   **Do not remove** the following line from `src/index.ts`:

  ```typescript
  #!/usr/bin/env node
  ```

- **Build Frequently:**  
   Run the build command after every change:

  ```bash
  npm run build
  ```

- **GraphQL Updates:**  
   If you add or modify GraphQL queries in `src/utils/shopify.ts`, regenerate types:

  ```bash
  npm run codegen
  ```

  - The generated types will be available in `src/types`.
  - Import them directly where needed:
    ```typescript
    import { SomeGraphQLType } from "../types/admin.types.js";
    ```

- **Global Linking:**
  - **You don’t need to re-run `npm link` after every build.**
  - To unlink the global installation:
    ```bash
    npm unlink -g
    ```

---

## 🚦 **Best Practices**

- Keep your commands modular and focused on single responsibilities.
- Follow TypeScript best practices for type safety and clarity.
- Document new commands in your `README` for consistency.

---

## 🤝 **Contributing**

- Fork the repository.
- Create a feature branch:
  ```bash
  git checkout -b feature/your-feature
  ```
- Make your changes, test thoroughly, and submit a pull request.

---

## ❓ **Need Help?**

If you encounter any issues:

- Check the error logs using the **`logger`** utility.
- Refer to the official documentation of dependencies:
  - [Commander](https://github.com/tj/commander.js)
  - [Inquirer](https://www.npmjs.com/package/inquirer)
  - [Winston](https://github.com/winstonjs/winston)
  - [Faker](https://fakerjs.dev/)
  - [Shopify Admin API Client](https://www.npmjs.com/package/@shopify/admin-api-client)

---

### ✅ **Well Done!**

You are now ready to build, expand, and maintain the **Mockify CLI** effectively. 🚀✨
