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
        rooms: listRoomCards_(user),
        entryRates: listEntryRates_(user),
        cleaningStaff: listCleaningStaffOptions_(user),
        shift: getShiftState_(user)
      }
    };
  } catch (error) {
    return apiError_(error);
  }
}

function apiOpenShift(): ApiResponse<ShiftState> {
  try { return { ok: true, data: openShift_(getCurrentUser_()) }; }
  catch (error) { return apiError_(error); }
}

function apiCloseShift(idTurno: string): ApiResponse<ShiftState> {
  try { return { ok: true, data: closeShift_(getCurrentUser_(), idTurno) }; }
  catch (error) { return apiError_(error); }
}

function apiRegisterEntry(input: EntryInput): ApiResponse<EntryResult> {
  try {
    return { ok: true, data: registerEntry_(getCurrentUser_(), input) };
  } catch (error) {
    return apiError_(error);
  }
}

function apiRegisterExit(input: ExitInput): ApiResponse<ExitResult> {
  try { return { ok: true, data: registerExit_(getCurrentUser_(), input) }; }
  catch (error) { return apiError_(error); }
}

function apiAssignCleaning(input: CleaningAssignmentInput): ApiResponse<CleaningAssignmentResult> {
  try { return { ok: true, data: assignCleaning_(getCurrentUser_(), input) }; }
  catch (error) { return apiError_(error); }
}

function apiCompleteCleaning(input: CleaningCompletionInput): ApiResponse<CleaningCompletionResult> {
  try { return { ok: true, data: completeCleaning_(getCurrentUser_(), input) }; }
  catch (error) { return apiError_(error); }
}

function apiGetRentalReport(): ApiResponse<RentalReportRow[]> {
  try { return { ok: true, data: listRentalReport_(getCurrentUser_()) }; }
  catch (error) { return apiError_(error); }
}

function apiGetCatalogs(): ApiResponse<CatalogState> {
  try { return { ok: true, data: listCatalogs_(getCurrentUser_()) }; }
  catch (error) { return apiError_(error); }
}

function apiSaveMotel(input: MotelInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveMotel_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSetMotelActive(id: string, active: boolean): ApiResponse<null> {
  try { setMotelActive_(getCurrentUser_(), id, active); return { ok: true, data: null }; }
  catch (error) { return apiError_(error); }
}

function apiSaveReceptionist(input: ReceptionistInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveReceptionist_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSetReceptionistActive(id: string, active: boolean): ApiResponse<null> {
  try { setReceptionistActive_(getCurrentUser_(), id, active); return { ok: true, data: null }; }
  catch (error) { return apiError_(error); }
}

function apiSaveCleaningStaff(input: CleaningStaffInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveCleaningStaff_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSetCleaningStaffActive(id: string, active: boolean): ApiResponse<null> {
  try { setCleaningStaffActive_(getCurrentUser_(), id, active); return { ok: true, data: null }; }
  catch (error) { return apiError_(error); }
}

function apiSaveCleaningShift(input: CleaningShiftInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveCleaningShift_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSaveRoomType(input: RoomTypeInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveRoomType_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSetRoomTypeActive(id: string, active: boolean): ApiResponse<null> {
  try { setRoomTypeActive_(getCurrentUser_(), id, active); return { ok: true, data: null }; }
  catch (error) { return apiError_(error); }
}

function apiSaveRate(input: RateInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveRate_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSetRateActive(id: string, active: boolean): ApiResponse<null> {
  try { setRateActive_(getCurrentUser_(), id, active); return { ok: true, data: null }; }
  catch (error) { return apiError_(error); }
}

function apiSaveRoom(input: RoomInput): ApiResponse<{ id: string }> {
  try { return { ok: true, data: { id: saveRoom_(getCurrentUser_(), input) } }; }
  catch (error) { return apiError_(error); }
}

function apiSetRoomActive(id: string, active: boolean): ApiResponse<null> {
  try { setRoomActive_(getCurrentUser_(), id, active); return { ok: true, data: null }; }
  catch (error) { return apiError_(error); }
}

function apiError_<T>(error: unknown): ApiResponse<T> {
  const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  console.error(error);
  return { ok: false, error: { code: "FEMA_ERROR", message } };
}
