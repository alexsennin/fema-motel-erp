function getCurrentUser_(): FemaUser {
  const email = Session.getActiveUser().getEmail().trim().toLowerCase();
  if (!email) {
    throw new Error("No fue posible identificar tu cuenta de Google. El despliegue debe requerir inicio de sesión.");
  }

  const row = readRows_(FEMA_CONFIG.sheets.users).find((candidate) =>
    String(candidate.Correo).trim().toLowerCase() === email && candidate.Activo === true
  );
  if (!row || isExampleRow_(row)) throw new Error("Tu cuenta no está autorizada para usar FEMA.");

  return {
    idUsuario: String(row.IdUsuario),
    idMotel: String(row.IdMotel),
    email,
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
