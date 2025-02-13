import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import logger from "./logger.js";

dotenv.config(); // Load .env variables on startup

// Define the required environment variables
const REQUIRED_ENV_VARS = ["SHOP", "ACCESS_TOKEN"];

class Config {
  private envPath: string;

  constructor() {
    this.envPath = path.resolve(process.cwd(), ".env");
    if (process.argv.includes("setup")) return; // Skip checks during setup
    this.checkEnvFile(); // Ensure .env exists
    this.warnMissingEnvVars(); // Warn about missing variables
  }

  // Expose environment variables
  get shop(): string {
    return process.env.SHOP || "";
  }

  get accessToken(): string {
    return process.env.ACCESS_TOKEN || "";
  }

  // Ensure .env file exists
  private checkEnvFile() {
    if (!fs.existsSync(this.envPath)) {
      logger.warn("⚠️  .env file not found. Creating an empty .env file...");
      fs.writeFileSync(this.envPath, ""); // Create an empty .env file
      process.exit(1); // Exit the process to allow the user to populate the file
    }
  }

  // Warn about missing required environment variables
  private warnMissingEnvVars() {
    const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
      logger.warn(`⚠️  Missing required environment variables: ${missingVars.join(", ")}`);
      logger.warn("⚠️  Please run mockify setup.");
      process.exit(1); // Exit the process to allow the user to set up the variables
    }
  }

  // Update an environment variable dynamically
  updateEnv(key: string, value: string) {
    try {
      const envContent = fs.readFileSync(this.envPath, "utf-8");
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

      fs.writeFileSync(this.envPath, newEnv.join("\n"));
      process.env[key] = value; // Update in-memory env variable
      logger.info(`✅ Environment variable "${key}" updated successfully.`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ Failed to update environment variable: ${error.message}`);
      } else {
        logger.error("❌ An unknown error occurred while updating environment variables.");
      }
      throw error;
    }
  }
}

export default new Config();
