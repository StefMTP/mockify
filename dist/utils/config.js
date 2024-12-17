"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config(); // Load .env variables on startup
// Define the required environment variables
const REQUIRED_ENV_VARS = ["SHOP", "ACCESS_TOKEN"];
class Config {
  constructor() {
    this.envPath = path_1.default.resolve(process.cwd(), ".env");
    this.validateEnv();
  }
  // Expose environment variables
  get shop() {
    return process.env.SHOP || "";
  }
  get accessToken() {
    return process.env.ACCESS_TOKEN || "";
  }
  // Validate required environment variables
  validateEnv() {
    const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
      logger_1.default.error(
        `❌ Missing required environment variables: ${missingVars.join(", ")}`
      );
      process.exit(1);
    }
  }
  // Update an environment variable dynamically
  updateEnv(key, value) {
    try {
      const envContent = fs_1.default.readFileSync(this.envPath, "utf-8");
      const envLines = envContent.split("\n");
      let updated = false;
      const newEnv = envLines.map((line) => {
        if (line.startsWith(`${key}=`)) {
          updated = true;
          return `${key}=${value}`;
        }
        return line;
      });
      if (!updated) newEnv.push(`${key}=${value}`);
      fs_1.default.writeFileSync(this.envPath, newEnv.join("\n"));
      process.env[key] = value; // Update in-memory env variable
      logger_1.default.info(`✅ Environment variable "${key}" updated successfully.`);
    } catch (error) {
      if (error instanceof Error) {
        logger_1.default.error(`❌ Failed to update environment variable: ${error.message}`);
      } else {
        logger_1.default.error(
          "❌ An unknown error occurred while updating environment variables."
        );
      }
      throw error;
    }
  }
}
exports.default = new Config();
