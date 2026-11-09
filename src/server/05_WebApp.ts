function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("FEMA · Gestión de habitaciones")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function handleApi_<T>(action: () => T): ApiResponse<T> {
  clearRowsCache_();
  try {
    return { ok: true, data: action() };
  } catch (error) {
    return apiError_(error);
  }
}

function apiGetInitialState(): ApiResponse<InitialState> {
  return handleApi_(() => {
    const user = getCurrentUser_();
    return {
      user,
      generatedAt: Utilities.formatDate(now_(), FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      rooms: listRoomCards_(user),
      entryRates: listEntryRates_(user),
      vehicleSuggestions: listVehicleSuggestions_(user),
      cleaningStaff: listCleaningStaffOptions_(user),
      shift: getShiftState_(user)
    };
  });
}

function apiOpenShift(): ApiResponse<ShiftState> {
  return handleApi_(() => openShift_(getCurrentUser_()));
}

function apiCloseShift(idTurno: string): ApiResponse<ShiftState> {
  return handleApi_(() => closeShift_(getCurrentUser_(), idTurno));
}

function apiRegisterEntry(input: EntryInput): ApiResponse<EntryResult> {
  return handleApi_(() => registerEntry_(getCurrentUser_(), input));
}

function apiRegisterExit(input: ExitInput): ApiResponse<ExitResult> {
  return handleApi_(() => registerExit_(getCurrentUser_(), input));
}

function apiAddExtraPerson(input: AddExtraPersonInput): ApiResponse<AddExtraPersonResult> {
  return handleApi_(() => addExtraPerson_(getCurrentUser_(), input));
}

function apiEditActiveStay(input: EditActiveStayInput): ApiResponse<EditActiveStayResult> {
  return handleApi_(() => editActiveStay_(getCurrentUser_(), input));
}

function apiTransferRoom(input: TransferRoomInput): ApiResponse<TransferRoomResult> {
  return handleApi_(() => transferOccupiedRoom_(getCurrentUser_(), input));
}

function apiCancelStay(input: CancelStayInput): ApiResponse<CancelStayResult> {
  return handleApi_(() => cancelOccupiedStay_(getCurrentUser_(), input));
}

function apiUndoRoomState(input: UndoRoomStateInput): ApiResponse<UndoRoomStateResult> {
  return handleApi_(() => undoRoomState_(getCurrentUser_(), input));
}

function apiAssignCleaning(input: CleaningAssignmentInput): ApiResponse<CleaningAssignmentResult> {
  return handleApi_(() => assignCleaning_(getCurrentUser_(), input));
}

function apiCompleteCleaning(input: CleaningCompletionInput): ApiResponse<CleaningCompletionResult> {
  return handleApi_(() => completeCleaning_(getCurrentUser_(), input));
}

function apiGetRentalReport(): ApiResponse<RentalReportRow[]> {
  return handleApi_(() => listRentalReport_(getCurrentUser_()));
}

function apiGetCatalogs(): ApiResponse<CatalogState> {
  return handleApi_(() => listCatalogs_(getCurrentUser_()));
}

function apiSaveMotel(input: MotelInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveMotel_(getCurrentUser_(), input) }));
}

function apiSetMotelActive(id: string, active: boolean): ApiResponse<null> {
  return handleApi_(() => {
    setMotelActive_(getCurrentUser_(), id, active);
    return null;
  });
}

function apiSaveReceptionist(input: ReceptionistInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveReceptionist_(getCurrentUser_(), input) }));
}

function apiSetReceptionistActive(id: string, active: boolean): ApiResponse<null> {
  return handleApi_(() => {
    setReceptionistActive_(getCurrentUser_(), id, active);
    return null;
  });
}

function apiSaveCleaningStaff(input: CleaningStaffInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveCleaningStaff_(getCurrentUser_(), input) }));
}

function apiSetCleaningStaffActive(id: string, active: boolean): ApiResponse<null> {
  return handleApi_(() => {
    setCleaningStaffActive_(getCurrentUser_(), id, active);
    return null;
  });
}

function apiSaveCleaningShift(input: CleaningShiftInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveCleaningShift_(getCurrentUser_(), input) }));
}

function apiSaveRoomType(input: RoomTypeInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveRoomType_(getCurrentUser_(), input) }));
}

function apiSetRoomTypeActive(id: string, active: boolean): ApiResponse<null> {
  return handleApi_(() => {
    setRoomTypeActive_(getCurrentUser_(), id, active);
    return null;
  });
}

function apiSaveRate(input: RateInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveRate_(getCurrentUser_(), input) }));
}

function apiSetRateActive(id: string, active: boolean): ApiResponse<null> {
  return handleApi_(() => {
    setRateActive_(getCurrentUser_(), id, active);
    return null;
  });
}

function apiSaveRoom(input: RoomInput): ApiResponse<{ id: string }> {
  return handleApi_(() => ({ id: saveRoom_(getCurrentUser_(), input) }));
}

function apiSetRoomActive(id: string, active: boolean): ApiResponse<null> {
  return handleApi_(() => {
    setRoomActive_(getCurrentUser_(), id, active);
    return null;
  });
}

function apiGetProductsAndInventory(): ApiResponse<ProductInventoryItem[]> {
  return handleApi_(() => getProductsAndInventory_(getCurrentUser_()));
}

function apiGetOccupiedRoomsForSale(): ApiResponse<OccupiedRoomOption[]> {
  return handleApi_(() => getOccupiedRoomsForSale_(getCurrentUser_()));
}

function apiGetStayAccount(idHabitacion: string): ApiResponse<StayAccount> {
  return handleApi_(() => getStayAccount_(getCurrentUser_(), idHabitacion));
}

function apiSaveProduct(input: SaveProductInput): ApiResponse<{ id: string }> {
  return handleApi_(() => saveProduct_(getCurrentUser_(), input));
}

function apiTransferInventory(input: TransferInventoryInput): ApiResponse<null> {
  return handleApi_(() => {
    transferInventory_(getCurrentUser_(), input);
    return null;
  });
}

function apiAdjustInventory(input: AdjustInventoryInput): ApiResponse<null> {
  return handleApi_(() => {
    adjustInventory_(getCurrentUser_(), input);
    return null;
  });
}

function apiRegisterRoomSale(input: RegisterSaleInput): ApiResponse<RegisterSaleResult> {
  return handleApi_(() => registerSaleToRoom_(getCurrentUser_(), input));
}

function apiGetInventoryMovements(): ApiResponse<InventoryMovementRecord[]> {
  return handleApi_(() => getInventoryMovements_(getCurrentUser_()));
}

function apiAdminRepairInventory(): ApiResponse<{ productos: number }> {
  return handleApi_(() => adminRepairInventory_(getCurrentUser_()));
}

function apiError_<T>(error: unknown): ApiResponse<T> {
  const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  console.error(error);
  return { ok: false, error: { code: "FEMA_ERROR", message } };
}
