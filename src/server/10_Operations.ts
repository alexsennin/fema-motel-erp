function runIdempotent_<T>(user: FemaUser, key: string, tipo: string, fn: () => T): T {
  const cleanKey = String(key ?? "").trim();
  if (!cleanKey) throw new Error("Falta la clave de idempotencia de la operación.");
  if (cleanKey.length > 160) throw new Error("La clave de idempotencia no es válida.");

  return withScriptLock_(() => {
    const existing = findRowById_(FEMA_CONFIG.sheets.operations, "IdOperacion", cleanKey);
    if (existing) {
      const estado = String(existing.Estado);
      if (estado === "CONFIRMADA") {
        const rawJson = String(existing.ResultadoJSON || "null");
        try {
          return JSON.parse(rawJson) as T;
        } catch (e) {
          return null as unknown as T;
        }
      }
      if (estado === "EN_CURSO") {
        throw new Error("Operación en proceso, actualiza el tablero.");
      }
    }

    const now = now_();
    if (!existing) {
      appendRow_(FEMA_CONFIG.sheets.operations, {
        IdOperacion: cleanKey,
        IdMotel: user.idMotel,
        Tipo: tipo,
        Estado: "EN_CURSO",
        ResultadoJSON: "",
        IdUsuario: user.idUsuario,
        FechaHora: now
      });
    } else {
      updateRowById_(FEMA_CONFIG.sheets.operations, "IdOperacion", cleanKey, {
        Estado: "EN_CURSO",
        FechaHora: now
      });
    }

    try {
      const result = fn();
      updateRowById_(FEMA_CONFIG.sheets.operations, "IdOperacion", cleanKey, {
        Estado: "CONFIRMADA",
        ResultadoJSON: JSON.stringify(result ?? null),
        FechaHora: now_()
      });
      return result;
    } catch (error) {
      try {
        updateRowById_(FEMA_CONFIG.sheets.operations, "IdOperacion", cleanKey, {
          Estado: "FALLIDA",
          FechaHora: now_()
        });
      } catch (ignored) {}
      throw error;
    }
  });
}
