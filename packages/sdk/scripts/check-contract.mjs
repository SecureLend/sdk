import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contract = readFileSync(join(root, "src/contract.ts"), "utf8");
const routes = [...contract.matchAll(/^\s+(\w+):\s+"(\/v1\/[^"]+)"/gm)].map((match) => ({
  key: match[1],
  path: match[2],
}));
if (routes.length < 14) {
  console.error("expected the platform route table in src/contract.ts");
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full.endsWith(".ts") ? [full] : [];
  });
}

const resourceSource = walk(join(root, "src/resources"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
for (const route of routes) {
  if (!resourceSource.includes(`PLATFORM_ROUTES.${route.key}`)) {
    console.error(`route is not used by a resource: ${route.key}`);
    process.exit(1);
  }
}

const openapiPath = process.env.SECURELEND_OPENAPI;
if (openapiPath) {
  const yaml = readFileSync(openapiPath, "utf8");
  for (const route of routes) {
    const needle = route.path.split(":")[0].replace(/\/$/, "");
    if (!yaml.includes(needle)) {
      console.error(`openapi is missing ${route.path}`);
      process.exit(1);
    }
  }
}

console.log(`sdk contract ok (${routes.length} routes)`);
