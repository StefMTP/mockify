import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import logger from "./logger";

dotenv.config(); // Load .env variables on startup

// Define the required environment variables
const REQUIRED_ENV_VARS = ["SHOP", "ACCESS_TOKEN"];

class Config {
  private envPath: string;

  constructor() {
    this.envPath = path.resolve(process.cwd(), ".env");
    this.validateEnv();
  }

  // Expose environment variables
  get shop(): string {
    return process.env.SHOP || "";
  }

  get accessToken(): string {
    return process.env.ACCESS_TOKEN || "";
  }

  // Validate required environment variables
  private validateEnv() {
    const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
      logger.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
      process.exit(1);
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