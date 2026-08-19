import fs from "node:fs/promises";
import { spawn } from "node:child_process";

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: "inherit", shell: false });
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} terminó con código ${code}`)));
});

await fs.rm("dist", { recursive: true, force: true });
await fs.mkdir("dist", { recursive: true });
await run("./node_modules/.bin/tsc", ["--project", "tsconfig.json"]);
await Promise.all([
  fs.copyFile("appsscript.json", "dist/appsscript.json"),
  fs.copyFile("src/client/Index.html", "dist/Index.html"),
]);
console.log("Build de Apps Script generado en dist/.");

