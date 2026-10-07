import { TddApp } from "tdd-app";

const sdk = new TddApp({
  serverURL: "http://localhost:4000",
});

async function main() {
  const health = await sdk.health.getHealth();

  console.log("Health:");
  console.log(health);

  const challenges = await sdk.challenges.listChallenges();

  console.log("\nChallenges:");
  console.log(challenges);

  const challenge = await sdk.challenges.getChallenge({
    id: "react-counter",
  });

  console.log("\nSingle Challenge:");
  console.log(challenge);
}

main().catch((error) => {
  console.error("SDK request failed:");
  console.error(error);
  process.exit(1);
});