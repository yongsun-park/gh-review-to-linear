const API_URL = "https://api.linear.app/graphql";

async function gql(apiKey, query, variables = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Linear API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Linear GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  return json.data;
}

export async function getTeam(apiKey, teamKey) {
  const data = await gql(apiKey, `
    query ($key: String!) {
      teams(filter: { key: { eq: $key } }) {
        nodes { id name key }
      }
    }
  `, { key: teamKey });

  const team = data.teams.nodes[0];
  if (!team) throw new Error(`Team with key "${teamKey}" not found`);
  return team;
}

export async function findOrCreateLabel(apiKey, teamId, labelName) {
  const data = await gql(apiKey, `
    query ($teamId: String!) {
      issueLabels(filter: { team: { id: { eq: $teamId } } }) {
        nodes { id name }
      }
    }
  `, { teamId });

  const existing = data.issueLabels.nodes.find(
    (l) => l.name.toLowerCase() === labelName.toLowerCase()
  );
  if (existing) return existing.id;

  const created = await gql(apiKey, `
    mutation ($teamId: String!, $name: String!) {
      issueLabelCreate(input: { teamId: $teamId, name: $name }) {
        issueLabel { id name }
        success
      }
    }
  `, { teamId, name: labelName });

  return created.issueLabelCreate.issueLabel.id;
}

export async function issueExistsForPR(apiKey, prUrl) {
  const data = await gql(apiKey, `
    query ($term: String!) {
      searchIssues(term: $term) {
        nodes { id description }
      }
    }
  `, { term: prUrl });

  return data.searchIssues.nodes.some(
    (issue) => issue.description && issue.description.includes(prUrl)
  );
}

export async function createIssue(apiKey, { teamId, labelId, title, description }) {
  const data = await gql(apiKey, `
    mutation ($teamId: String!, $title: String!, $description: String!, $labelIds: [String!]) {
      issueCreate(input: {
        teamId: $teamId
        title: $title
        description: $description
        labelIds: $labelIds
      }) {
        issue { id identifier url title }
        success
      }
    }
  `, { teamId, title, description, labelIds: [labelId] });

  return data.issueCreate.issue;
}
