import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { runInNewContext } from "node:vm";
import { localSeed, localUserEmail, sheetHeaders } from "./seed-data.mjs";
import { runConcurrentRpc } from "./concurrency.mjs";
import {
  createClock,
  createDatabaseBuffers,
  createLocalRuntime,
  createLocalStore,
  createScriptLockBuffer,
} from "./harness.mjs";

const port = Number(process.env.PORT || 8787);
const defaultIdentity = String(process.env.FEMA_LOCAL_USER_EMAIL || localUserEmail).trim().toLowerCase();
const outputPath = "/tmp/fema-local-Code.js";

function compileAppsScript() {
  return new Promise((resolve, reject) => {
    const child = spawn("./node_modules/.bin/tsc", ["--project", "tsconfig.json", "--outFile", outputPath], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", async (code) => {
      if (code !== 0) reject(new Error(`tsc terminó con código ${code}`));
      else {
        try { resolve(await readFile(outputPath, "utf8")); }
        catch (error) { reject(error); }
      }
    });
  });
}

const compiledSource = await compileAppsScript();
const bridgeTemplate = await readFile(new URL("./bridge.js", import.meta.url), "utf8");
const bridge = bridgeTemplate.replace("\"__FEMA_LOCAL_DEFAULT_IDENTITY__\"", JSON.stringify(defaultIdentity));
const html = await readFile("src/client/Index.html", "utf8");
const localHtml = html.replace("<base target=\"_top\">", `<base target="_top"><script>${bridge}</script>`);
const { dataBuffer, databaseLockBuffer } = createDatabaseBuffers();
const failureState = { next: null };
const store = createLocalStore({ dataBuffer, databaseLockBuffer, failureState });
const scriptLockBuffer = createScriptLockBuffer();
const clock = createClock();
const identities = new Map(localSeed.Usuarios.map((user) => [String(user.Correo).trim().toLowerCase(), String(user.Correo).trim().toLowerCase()]));

if (!identities.has(defaultIdentity)) {
  throw new Error(`FEMA_LOCAL_USER_EMAIL debe coincidir con una identidad fixture: ${[...identities.keys()].join(", ")}`);
}

const contexts = new Map([...identities].map(([email]) => [email, createLocalRuntime({ store, identity: email, clock, scriptLockBuffer })]));

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 64_000) throw new Error("Solicitud demasiado grande.");
  }
  return JSON.parse(body || "{}");
}

function resolveIdentity(value) {
  const identity = String(value || defaultIdentity).trim().toLowerCase();
  return contexts.has(identity) ? identity : null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  if (request.method === "GET" && url.pathname === "/__local/health") {
    json(response, 200, { ok: true, runtime: "apps-script-local-harness", data: "shared in-memory fixtures only", identities: [...identities.keys()] });
    return;
  }
  if (request.method === "GET" && url.pathname === "/__local/state") {
    const name = url.searchParams.get("sheet") || "";
    if (!Object.hasOwn(sheetHeaders, name)) {
      json(response, 400, { ok: false, error: "Pestaña local desconocida." });
      return;
    }
    json(response, 200, { ok: true, sheet: name, records: store.inspect(name) });
    return;
  }
  if (request.method === "POST" && url.pathname === "/__local/clock") {
    try {
      const { now } = await readBody(request);
      const epochMs = Date.parse(String(now));
      if (!Number.isFinite(epochMs)) throw new Error("El reloj local requiere una fecha reconocida.");
      clock.set(epochMs);
      json(response, 200, { ok: true, now: new Date(clock.now()).toISOString() });
    } catch (error) {
      json(response, 400, { ok: false, error: error instanceof Error ? error.message : "No se pudo cambiar el reloj local." });
    }
    return;
  }
  if (request.method === "POST" && url.pathname === "/__local/failure") {
    try {
      const { sheet, row, column } = await readBody(request);
      store.armWriteFailure({ sheet, row: Number(row), column: Number(column) });
      json(response, 200, { ok: true, armed: { sheet, row: Number(row), column: Number(column), count: 1 } });
    } catch (error) {
      json(response, 400, { ok: false, error: error instanceof Error ? error.message : "No se pudo armar la falla local." });
    }
    return;
  }
  if (request.method === "POST" && url.pathname === "/__local/concurrency") {
    try {
      const { identity: requestedIdentity, method = "apiOpenShift", holdWriteMs = 100 } = await readBody(request);
      const identity = resolveIdentity(requestedIdentity);
      if (!identity) {
        json(response, 403, { ok: false, error: { code: "LOCAL_IDENTITY_NOT_FOUND", message: "La identidad no existe en las fixtures locales." } });
        return;
      }
      if (method !== "apiOpenShift") throw new Error("La prueba concurrente local sólo ejecuta dos aperturas del mismo turno/hotel.");
      const hold = Math.max(10, Math.min(1_000, Number(holdWriteMs) || 100));
      const result = await runConcurrentRpc({
        compiledSource,
        dataBuffer,
        databaseLockBuffer,
        scriptLockBuffer,
        identity,
        clockEpochMs: clock.now(),
        method,
        args: [],
        writeHoldMs: hold,
      });
      json(response, 200, { ok: true, ...result });
    } catch (error) {
      json(response, 500, { ok: false, error: error instanceof Error ? error.message : "Falló la prueba concurrente local." });
    }
    return;
  }
  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/Index.html")) {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(localHtml);
    return;
  }
  if (request.method === "POST" && url.pathname === "/__local/rpc") {
    try {
      const { method, args = [], identity: requestedIdentity } = await readBody(request);
      const identity = resolveIdentity(requestedIdentity);
      if (!identity) {
        json(response, 403, { ok: false, error: { code: "LOCAL_IDENTITY_NOT_FOUND", message: "La identidad no existe en las fixtures locales." } });
        return;
      }
      const context = contexts.get(identity);
      if (typeof method !== "string" || !/^api[A-Za-z0-9]+$/.test(method) || typeof context?.[method] !== "function") {
        json(response, 404, { ok: false, error: { code: "LOCAL_METHOD_NOT_FOUND", message: "Método local no disponible." } });
        return;
      }
      const result = context[method](...(Array.isArray(args) ? args : []));
      json(response, 200, result);
    } catch (error) {
      json(response, 500, { ok: false, error: { code: "LOCAL_RUNTIME_ERROR", message: error instanceof Error ? error.message : "Error local." } });
    }
    return;
  }
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

const listenHost = process.env.FEMA_LOCAL_DOCKER === "1" ? "0.0.0.0" : "127.0.0.1";
server.listen(port, listenHost, () => console.log(`FEMA local listo en http://localhost:${port} (fixtures en memoria, sin conexión a Google).`));
