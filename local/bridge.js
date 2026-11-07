/* FEMA_LOCAL_BRIDGE_START */
let localIdentity = "__FEMA_LOCAL_DEFAULT_IDENTITY__";
function makeLocalRunner(successHandler = null, failureHandler = null) {
  return new Proxy({}, {
    get(_target, property) {
      if (property === "withSuccessHandler") return (handler) => makeLocalRunner(handler, failureHandler);
      if (property === "withFailureHandler") return (handler) => makeLocalRunner(successHandler, handler);
      if (property === "then") return undefined;
      return (...args) => fetch("/__local/rpc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ method: String(property), args, identity: localIdentity }),
      }).then((response) => response.json()).then((value) => successHandler?.(value)).catch((error) => failureHandler?.(error));
    },
  });
}
window.google = { script: { run: makeLocalRunner() } };
window.__femaLocal = {
  setIdentity(email) { localIdentity = String(email).trim().toLowerCase(); },
  getIdentity() { return localIdentity; },
};
/* FEMA_LOCAL_BRIDGE_END */
