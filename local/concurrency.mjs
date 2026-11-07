import { Worker } from "node:worker_threads";
import { sharedLockContentions } from "./harness.mjs";

function startWorker({ compiledSource, dataBuffer, databaseLockBuffer, scriptLockBuffer, identity, clockEpochMs, method, args, startBuffer, readyBuffer, writeHoldMs }) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./rpc-worker.mjs", import.meta.url), {
      workerData: {
        compiledSource, dataBuffer, databaseLockBuffer, scriptLockBuffer, identity, clockEpochMs,
        method, args, startBuffer, readyBuffer, writeHoldMs,
      },
    });
    let settled = false;
    worker.on("message", (message) => {
      if (Object.hasOwn(message, "result") || Object.hasOwn(message, "thrown")) {
        settled = true;
        resolve(message);
      }
    });
    worker.on("error", (error) => {
      settled = true;
      reject(error);
    });
    worker.on("exit", (code) => {
      if (!settled && code !== 0) reject(new Error(`Worker de RPC local terminó con código ${code}.`));
      else if (!settled) reject(new Error("Worker de RPC local terminó sin resultado."));
    });
  });
}

export async function runConcurrentRpc({
  compiledSource,
  dataBuffer,
  databaseLockBuffer,
  scriptLockBuffer,
  identity,
  clockEpochMs,
  method,
  args = [],
  writeHoldMs = 100,
}) {
  const contentionsBefore = sharedLockContentions(scriptLockBuffer);
  const startBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const readyBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const workerResults = Promise.all(Array.from({ length: 2 }, () => startWorker({
    compiledSource, dataBuffer, databaseLockBuffer, scriptLockBuffer, identity, clockEpochMs,
    method, args, startBuffer, readyBuffer, writeHoldMs,
  })));
  let workerFailure = null;
  workerResults.catch((error) => { workerFailure = error; });

  const ready = new Int32Array(readyBuffer);
  const deadline = Date.now() + 15_000;
  while (Atomics.load(ready, 0) < 2) {
    if (workerFailure) throw workerFailure;
    if (Date.now() > deadline) throw new Error("Los workers locales no iniciaron a tiempo.");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  Atomics.store(new Int32Array(startBuffer), 0, 1);
  Atomics.notify(new Int32Array(startBuffer), 0, 2);

  const raw = await workerResults;
  return {
    results: raw.map((outcome) => outcome.result ?? { ok: false, error: { message: outcome.thrown } }),
    contendedLockAttempts: sharedLockContentions(scriptLockBuffer) - contentionsBefore,
  };
}
