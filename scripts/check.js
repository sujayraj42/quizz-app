const { spawnSync } = require("node:child_process");

const files = [
  "server/index.js",
  "server/socket.js",
  "server/roomManager.js",
  "server/ml/mlRouter.js",
  "server/ml/analytics.js",
  "server/ml/insightGenerator.js",
  "server/ml/recommendations.js",
  "public/js/shared.js",
  "public/js/host.js",
  "public/js/player.js",
  "public/js/display.js",
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("Syntax check passed.");
