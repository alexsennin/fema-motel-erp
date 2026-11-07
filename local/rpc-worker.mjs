import { parentPort, workerData } from "node:worker_threads";
import { runInNewContext } from "node:vm";
import { createLocalRuntime, createLocalStore } from "./harness.mjs";

const store = createLocalStore({
  dataBuffer: workerData.dataBuffer,
  databaseLockBuffer: workerData.databaseLockBuffer,
  writeHoldMs: workerData.writeHoldMs,
});
const clock = { now: () => workerData.clockEpochMs };
const context = createLocalRuntime({
  store,
  identity: workerData.identity,
  clock,
  scriptLockBuffer: workerData.scriptLockBuffer,
  logger: { log() {}, warn() {}, error() {} },
});
runInNewContext(workerData.compiledSource, context, { filename: "FEMA-Code.js" });

parentPort.postMessage({ ready: true });
const ready = new Int32Array(workerData.readyBuffer);
Atomics.add(ready, 0, 1);
Atomics.notify(ready, 0, 1);
const start = new Int32Array(workerData.startBuffer);
while (Atomics.load(start, 0) === 0) Atomics.wait(start, 0, 0);

try {
  const method = context[workerData.method];
  if (typeof method !== "function") throw new Error("RPC local no disponible en el worker.");
  parentPort.postMessage({ result: method(...workerData.args) });
} catch (error) {
  parentPort.postMessage({ thrown: error instanceof Error ? error.message : String(error) });
}
parentPort.close();
