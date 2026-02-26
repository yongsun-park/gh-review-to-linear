import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

config({ path: join(ROOT, ".env") });

const REQUIRED = ["LINEAR_API_KEY", "LINEAR_TEAM_KEY"];

export function loadConfig() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    console.error("Run `node setup.js` to configure.");
    process.exit(1);
  }

  return {
    linearApiKey: process.env.LINEAR_API_KEY,
    linearTeamKey: process.env.LINEAR_TEAM_KEY,
    linearLabelName: process.env.LINEAR_LABEL_NAME || "review",
  };
}
