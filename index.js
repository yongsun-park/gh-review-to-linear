#!/usr/bin/env node

import { loadConfig } from "./lib/config.js";
import { fetchReviewRequests } from "./lib/github.js";
import { getTeam, findOrCreateLabel, issueExistsForPR, createIssue } from "./lib/linear.js";

async function main() {
  const cfg = loadConfig();

  console.log("Fetching PR review requests...");
  const prs = await fetchReviewRequests();

  if (prs.length === 0) {
    console.log("No pending review requests found.");
    return;
  }

  console.log(`Found ${prs.length} PR(s) requesting your review.`);

  const team = await getTeam(cfg.linearApiKey, cfg.linearTeamKey);
  const labelId = await findOrCreateLabel(cfg.linearApiKey, team.id, cfg.linearLabelName);

  let created = 0;
  let skipped = 0;

  for (const pr of prs) {
    const exists = await issueExistsForPR(cfg.linearApiKey, pr.url);
    if (exists) {
      console.log(`  skip: ${pr.repo}#${pr.number} (already tracked)`);
      skipped++;
      continue;
    }

    const title = `Review: ${pr.repo}#${pr.number} — ${pr.title}`;
    const description = [
      `**PR:** [${pr.repo}#${pr.number}](${pr.url})`,
      `**Author:** ${pr.author}`,
      "",
      `> ${pr.title}`,
      "",
      pr.url,
    ].join("\n");

    const issue = await createIssue(cfg.linearApiKey, {
      teamId: team.id,
      labelId,
      title,
      description,
    });

    console.log(`  created: ${issue.identifier} — ${issue.title}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
