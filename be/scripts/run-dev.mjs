import { spawn } from "node:child_process";
import path from "node:path";

const appEnv = process.argv[2] === "production" ? "production" : "local";
const nodeEnv = appEnv === "production" ? "production" : "development";
const nodemonCli = path.resolve(process.cwd(), "node_modules", "nodemon", "bin", "nodemon.js");
const tsxCli = path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

const child = spawn(
  process.execPath,
  [nodemonCli, "--exec", `${process.execPath} ${tsxCli}`, "src/index.ts"],
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
