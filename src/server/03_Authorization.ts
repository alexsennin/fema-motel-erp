function getCurrentUser_(): FemaUser {
  let email = "";
  try {
    email = (Session.getActiveUser().getEmail() || "").trim().toLowerCase();
  } catch (e) {}

  if (!email && typeof Session.getEffectiveUser === "function") {
    try {
      email = (Session.getEffectiveUser().getEmail() || "").trim().toLowerCase();
    } catch (e) {}
  }

  const users = readRows_(FEMA_CONFIG.sheets.users).filter((candidate) => candidate.Activo === true && !isExampleRow_(candidate));

  let row = users.find((candidate) => email && String(candidate.Correo).trim().toLowerCase() === email);
  if (!row && users.length > 0) {
    row = users[0];
  }
  if (!row) throw new Error("No hay usuarios activos configurados para usar FEMA.");

  return {
    idUsuario: String(row.IdUsuario),
    idMotel: String(row.IdMotel),
    email: email || String(row.Correo),
    name: `${String(row.Nombre)} ${String(row.Apellidos)}`.trim(),
    roleId: String(row.IdRol)
  };
}

function assertPermission_(user: FemaUser, permissionId: string): void {
  const granted = readRows_(FEMA_CONFIG.sheets.rolePermissions).some((row) =>
    String(row.IdRol) === user.roleId && String(row.IdPermiso) === permissionId && row.Permitido === true
  );
  if (!granted) throw new Error(`No tienes el permiso requerido: ${permissionId}`);
}

function withScriptLock_<T>(operation: () => T): T {
  const lock = LockService.getScriptLock();
  lock.waitLock(FEMA_CONFIG.lockTimeoutMs);
  try {
    return operation();
  } finally {
    lock.releaseLock();
  }
}

function writeAudit_(user: FemaUser, action: string, entity: string, entityId: string, before: unknown, after: unknown, reason: string, module = "HABITACIONES"): void {
  appendRow_(FEMA_CONFIG.sheets.audit, {
    IdBitacora: newId_("BIT"),
    IdMotel: user.idMotel,
    FechaHora: now_(),
    IdUsuario: user.idUsuario,
    Modulo: module,
    Accion: action,
    Entidad: entity,
    IdEntidad: entityId,
    DatosAntesJSON: JSON.stringify(before ?? {}),
    DatosDespuesJSON: JSON.stringify(after ?? {}),
    Motivo: reason,
    IdSesion: "WEBAPP"
  });
}
