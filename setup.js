#!/usr/bin/env node

import { createInterface } from "node:readline";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, ".env");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("=== gh-review-to-linear setup ===\n");

  const defaults = {};
  if (existsSync(ENV_PATH)) {
    const existing = readFileSync(ENV_PATH, "utf-8");
    for (const line of existing.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) defaults[match[1].trim()] = match[2].trim();
    }
  }

  const apiKey = await ask(
    `Linear API key${defaults.LINEAR_API_KEY ? ` [${defaults.LINEAR_API_KEY.slice(0, 12)}...]` : ""}: `
  ) || defaults.LINEAR_API_KEY || "";

  const teamKey = await ask(
    `Linear team key (e.g. ENG)${defaults.LINEAR_TEAM_KEY ? ` [${defaults.LINEAR_TEAM_KEY}]` : ""}: `
  ) || defaults.LINEAR_TEAM_KEY || "";

  const labelName = await ask(
    `Label name [${defaults.LINEAR_LABEL_NAME || "review"}]: `
  ) || defaults.LINEAR_LABEL_NAME || "review";

  rl.close();

  if (!apiKey || !teamKey) {
    console.error("\nError: LINEAR_API_KEY and LINEAR_TEAM_KEY are required.");
    process.exit(1);
  }

  const content = [
    `LINEAR_API_KEY=${apiKey}`,
    `LINEAR_TEAM_KEY=${teamKey}`,
    `LINEAR_LABEL_NAME=${labelName}`,
    "",
  ].join("\n");

  writeFileSync(ENV_PATH, content);
  console.log(`\nSaved to ${ENV_PATH}`);
  console.log("Run `node index.js` to start syncing.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
