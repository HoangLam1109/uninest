import { spawn } from "node:child_process";
import path from "node:path";

const appEnv = process.argv[2] === "production" ? "production" : "local";
const nodeEnv = appEnv === "production" ? "production" : "development";
const nodemonCli = path.resolve(process.cwd(), "node_modules", "nodemon", "bin", "nodemon.js");
const tsxBin = path.resolve(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx",
);

const child = spawn(
  process.execPath,
  [nodemonCli, "--exec", tsxBin, "src/index.ts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      APP_ENV: appEnv,
      NODE_ENV: nodeEnv,
    },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
