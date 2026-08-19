function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("FEMA · Gestión de habitaciones")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function apiGetInitialState(): ApiResponse<InitialState> {
  try {
    const user = getCurrentUser_();
    return {
      ok: true,
      data: {
        user,
        generatedAt: Utilities.formatDate(now_(), FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        rooms: listRoomCards_(user)
      }
    };
  } catch (error) {
    return apiError_(error);
  }
}

function apiRegisterEntry(input: EntryInput): ApiResponse<{ idCiclo: string; idEstancia: string }> {
  try {
    return { ok: true, data: registerEntry_(getCurrentUser_(), input) };
  } catch (error) {
    return apiError_(error);
  }
}

function apiError_<T>(error: unknown): ApiResponse<T> {
  const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  console.error(error);
  return { ok: false, error: { code: "FEMA_ERROR", message } };
}

