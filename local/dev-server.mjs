import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { runInNewContext } from "node:vm";
import { localSeed, localUserEmail, sheetHeaders } from "./seed-data.mjs";

const port = Number(process.env.PORT || 8787);
const localEmail = String(process.env.FEMA_LOCAL_USER_EMAIL || localUserEmail).trim().toLowerCase();
const outputPath = "/tmp/fema-local-Code.js";

function compileAppsScript() {
  return new Promise((resolve, reject) => {
    const child = spawn("./node_modules/.bin/tsc", ["--project", "tsconfig.json", "--outFile", outputPath], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`tsc terminó con código ${code}`)));
  });
}

function makeSheet(name) {
  const headers = sheetHeaders[name] || [];
  const rows = (localSeed[name] || []).map((record) => headers.map((header) => record[header] ?? ""));
  return {
    getLastColumn: () => headers.length,
    getLastRow: () => 4 + rows.length,
    getRange(row, column, numberOfRows = 1, numberOfColumns = 1) {
      const readCell = (r, c) => r === 4 ? headers[c - 1] ?? "" : rows[r - 5]?.[c - 1] ?? "";
      const display = (value) => value instanceof Date ? value.toISOString() : String(value ?? "");
      return {
        getValues: () => Array.from({ length: numberOfRows }, (_, r) => Array.from({ length: numberOfColumns }, (_, c) => readCell(row + r, column + c))),
        getDisplayValues: () => Array.from({ length: numberOfRows }, (_, r) => Array.from({ length: numberOfColumns }, (_, c) => display(readCell(row + r, column + c)))),
        setValue(value) { this.setValues([[value]]); },
        setValues(values) {
          values.forEach((newRow, r) => {
            const targetRow = row + r - 5;
            while (rows.length <= targetRow) rows.push(Array(headers.length).fill(""));
            newRow.forEach((value, c) => { rows[targetRow][column + c - 1] = value; });
          });
        },
      };
    },
  };
}

const sheets = new Map(Object.keys(sheetHeaders).map((name) => [name, makeSheet(name)]));
const spreadsheet = { getSheetByName: (name) => sheets.get(name) || null };

function formatDate(date, timeZone, pattern) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  if (pattern === "HH:mm") return `${parts.hour}:${parts.minute}`;
  if (pattern === "yyyy-MM-dd") return `${parts.year}-${parts.month}-${parts.day}`;
  const localAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  const offsetMinutes = Math.round((localAsUtc - date.getTime()) / 60000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const offset = Math.abs(offsetMinutes);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${String(Math.floor(offset / 60)).padStart(2, "0")}:${String(offset % 60).padStart(2, "0")}`;
}

const context = {
  console,
  SpreadsheetApp: { openById: () => spreadsheet },
  Session: { getActiveUser: () => ({ getEmail: () => localEmail }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: { getUuid: randomUUID, formatDate },
};

await compileAppsScript();
runInNewContext(await readFile(outputPath, "utf8"), context, { filename: "FEMA-Code.js" });
const html = await readFile("src/client/Index.html", "utf8");
const localBridge = `<script>
const femaCallbacks={success:null,failure:null};let femaRunner;femaRunner=new Proxy({}, {get(_target, property){if(property==="withSuccessHandler")return fn=>{femaCallbacks.success=fn;return femaRunner};if(property==="withFailureHandler")return fn=>{femaCallbacks.failure=fn;return femaRunner};return (...args)=>fetch("/__local/rpc",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({method:String(property),args})}).then(response=>response.json()).then(value=>femaCallbacks.success?.(value)).catch(error=>femaCallbacks.failure?.(error))}});window.google={script:{run:femaRunner}};
</script>`;
const localHtml = html.replace("<base target=\"_top\">", `<base target="_top">${localBridge}`);

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 64_000) throw new Error("Solicitud demasiado grande.");
  }
  return JSON.parse(body || "{}");
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  if (request.method === "GET" && url.pathname === "/__local/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, runtime: "apps-script-emulator", data: "in-memory fixtures only" }));
    return;
  }
  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/Index.html")) {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(localHtml);
    return;
  }
  if (request.method === "POST" && url.pathname === "/__local/rpc") {
    try {
      const { method, args = [] } = await readBody(request);
      if (typeof method !== "string" || !/^api[A-Za-z0-9]+$/.test(method) || typeof context[method] !== "function") {
        response.writeHead(404, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false, error: { code: "LOCAL_METHOD_NOT_FOUND", message: "Método local no disponible." } }));
        return;
      }
      const result = context[method](...args);
      response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      response.end(JSON.stringify(result));
    } catch (error) {
      response.writeHead(500, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: { code: "LOCAL_RUNTIME_ERROR", message: error instanceof Error ? error.message : "Error local." } }));
    }
    return;
  }
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, "0.0.0.0", () => console.log(`FEMA local listo en http://localhost:${port} (fixtures efímeros, sin conexión a Google).`));
