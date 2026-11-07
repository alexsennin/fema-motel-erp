const DEFAULT_MENU_ITEMS: ReadonlyArray<{ categoria: string; nombre: string; precioVenta: number }> = Object.freeze([
  // SEX-SHOP
  { categoria: "SEX-SHOP", nombre: "PLAYBOY (1 PZA.)", precioVenta: 40 },
  { categoria: "SEX-SHOP", nombre: "SICO SAFETY (3 PZA.)", precioVenta: 120 },
  { categoria: "SEX-SHOP", nombre: "LUBRICANTE ANESTÉSICO", precioVenta: 250 },
  { categoria: "SEX-SHOP", nombre: "LUBRICANTE", precioVenta: 150 },
  { categoria: "SEX-SHOP", nombre: "VIBRADOR", precioVenta: 700 },
  { categoria: "SEX-SHOP", nombre: "ANILLO VIBRADOR", precioVenta: 200 },

  // FARMACIA
  { categoria: "FARMACIA", nombre: "ASPIRINA (1 PZA.)", precioVenta: 10 },
  { categoria: "FARMACIA", nombre: "SEDALMERK (1 PZA.)", precioVenta: 10 },
  { categoria: "FARMACIA", nombre: "ALKA SELTZER (2 PZA.)", precioVenta: 10 },
  { categoria: "FARMACIA", nombre: "POST-DAY", precioVenta: 180 },
  { categoria: "FARMACIA", nombre: "VIAGRA", precioVenta: 200 },
  { categoria: "FARMACIA", nombre: "TOALLA FEMENINA", precioVenta: 10 },
  { categoria: "FARMACIA", nombre: "PASTA DENTAL", precioVenta: 35 },
  { categoria: "FARMACIA", nombre: "CEPILLO DENTAL", precioVenta: 35 },
  { categoria: "FARMACIA", nombre: "RASTRILLO", precioVenta: 35 },
  { categoria: "FARMACIA", nombre: "SHAMPOO EN SOBRE", precioVenta: 10 },
  { categoria: "FARMACIA", nombre: "CREMA PARA PEINAR", precioVenta: 10 },

  // ALIMENTOS
  { categoria: "ALIMENTOS", nombre: "PIZZA PEPERONI", precioVenta: 180 },
  { categoria: "ALIMENTOS", nombre: "CHICKEN BAKE", precioVenta: 80 },
  { categoria: "ALIMENTOS", nombre: "BONELESS BÚFALO (8PZAS)", precioVenta: 80 },
  { categoria: "ALIMENTOS", nombre: "SOPA INSTANTANEA", precioVenta: 40 },
  { categoria: "ALIMENTOS", nombre: "BAGUETTE", precioVenta: 110 },

  // DULCERÍA
  { categoria: "DULCERÍA", nombre: "HALLS", precioVenta: 15 },
  { categoria: "DULCERÍA", nombre: "CHICLES TRINDENT", precioVenta: 20 },
  { categoria: "DULCERÍA", nombre: "GALLETAS GAMESA", precioVenta: 35 },
  { categoria: "DULCERÍA", nombre: "SNICKER", precioVenta: 35 },

  // CIGARROS
  { categoria: "CIGARROS", nombre: "MALBORO ROJO", precioVenta: 140 },
  { categoria: "CIGARROS", nombre: "MALBORO BLANCO", precioVenta: 140 },
  { categoria: "CIGARROS", nombre: "MALBORO MENTOLADO", precioVenta: 150 },
  { categoria: "CIGARROS", nombre: "ENCENDEDOR", precioVenta: 45 },

  // BOTANA
  { categoria: "BOTANA", nombre: "SABRITAS GRANDES", precioVenta: 60 },
  { categoria: "BOTANA", nombre: "CACAHUATES", precioVenta: 30 },
  { categoria: "BOTANA", nombre: "PALOMITAS", precioVenta: 40 },

  // CERVEZA
  { categoria: "CERVEZA", nombre: "CORONA LIGHT", precioVenta: 38 },
  { categoria: "CERVEZA", nombre: "MODELO ESPECIAL", precioVenta: 35 },
  { categoria: "CERVEZA", nombre: "BOHEMIA", precioVenta: 40 },
  { categoria: "CERVEZA", nombre: "AMSTEL ULTRA", precioVenta: 35 },

  // BEBIDAS
  { categoria: "BEBIDAS", nombre: "COCA-COLA (350 ML)", precioVenta: 35 },
  { categoria: "BEBIDAS", nombre: "CARIBE COOLER", precioVenta: 43 },
  { categoria: "BEBIDAS", nombre: "SKY BLUE", precioVenta: 40 },
  { categoria: "BEBIDAS", nombre: "STRONGBOW", precioVenta: 40 },
  { categoria: "BEBIDAS", nombre: "NEW MIX", precioVenta: 40 },
  { categoria: "BEBIDAS", nombre: "BOOST", precioVenta: 50 },
  { categoria: "BEBIDAS", nombre: "VOLT", precioVenta: 40 },
  { categoria: "BEBIDAS", nombre: "JUMEX", precioVenta: 38 },
  { categoria: "BEBIDAS", nombre: "CAFÉ SOLUBLE", precioVenta: 30 },
  { categoria: "BEBIDAS", nombre: "CAPUCHINO INSTANTÁNEO", precioVenta: 35 },
  { categoria: "BEBIDAS", nombre: "AGUA MINERAL (600 ML)", precioVenta: 30 },
  { categoria: "BEBIDAS", nombre: "MANZANITA (600 ML)", precioVenta: 30 },
  { categoria: "BEBIDAS", nombre: "SQUIRT / FRESCA (600 ML)", precioVenta: 30 },
  { categoria: "BEBIDAS", nombre: "ELECTROLIT", precioVenta: 50 },
  { categoria: "BEBIDAS", nombre: "HIELO", precioVenta: 60 },

  // VINOS
  { categoria: "VINOS", nombre: "DON JULIO 70", precioVenta: 1999 },
  { categoria: "VINOS", nombre: "HERRADURA REPOSADO (700ML)", precioVenta: 1499 },
  { categoria: "VINOS", nombre: "MTRO. DOBEL TEQUILERO", precioVenta: 1499 },
  { categoria: "VINOS", nombre: "CENTENARIO PLATA", precioVenta: 549 },
  { categoria: "VINOS", nombre: "1800 CRISTALINO AÑEJO", precioVenta: 1499 },
  { categoria: "VINOS", nombre: "JOSE CUERVO TRADICIONAL", precioVenta: 1399 },
  { categoria: "VINOS", nombre: "ABSOLUT BLANCO", precioVenta: 999 },
  { categoria: "VINOS", nombre: "SMIRNOFF NATURAL", precioVenta: 799 },
  { categoria: "VINOS", nombre: "SMIRNOFF TAMARINDO", precioVenta: 799 },
  { categoria: "VINOS", nombre: "BUCHANAS 12", precioVenta: 1999 },
  { categoria: "VINOS", nombre: "RED LABEL JOHNIE WALKER", precioVenta: 899 },
  { categoria: "VINOS", nombre: "CONCHA Y TORO", precioVenta: 299 },
  { categoria: "VINOS", nombre: "LAMBRUSCO", precioVenta: 399 },
  { categoria: "VINOS", nombre: "BACARDI BLANCO", precioVenta: 799 },
  { categoria: "VINOS", nombre: "MARTELL VSOP", precioVenta: 1699 },
  { categoria: "VINOS", nombre: "TORRES 10", precioVenta: 1299 }
]);

function healProductsSheet_(motelId: string): void {
  try {
    const sheet = getRequiredSheet_(FEMA_CONFIG.sheets.products);
    const standardHeaders = DEFAULT_SHEET_HEADERS_.Productos;
    sheet.getRange(FEMA_CONFIG.headerRow, 1, 1, standardHeaders.length).setValues([standardHeaders]);

    const lastRow = sheet.getLastRow();
    if (lastRow < FEMA_CONFIG.dataStartRow) return;

    const numRows = lastRow - FEMA_CONFIG.dataStartRow + 1;
    const range = sheet.getRange(FEMA_CONFIG.dataStartRow, 1, numRows, standardHeaders.length);
    const values = range.getValues();

    let modified = false;
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const cat = String(row[2] ?? "").trim();
      const name = String(row[3] ?? "").trim();
      const price = Number(row[4] ?? 0);

      if (!name || name === "undefined" || name === "null" || cat === "GENERAL" || !cat) {
        let matchedItem: { categoria: string; nombre: string; precioVenta: number } | undefined;
        if (i < DEFAULT_MENU_ITEMS.length && (!price || DEFAULT_MENU_ITEMS[i].precioVenta === price)) {
          matchedItem = DEFAULT_MENU_ITEMS[i];
        } else {
          matchedItem = DEFAULT_MENU_ITEMS.find((m) => m.precioVenta === price) || (i < DEFAULT_MENU_ITEMS.length ? DEFAULT_MENU_ITEMS[i] : undefined);
        }
        if (matchedItem) {
          row[2] = matchedItem.categoria;
          row[3] = matchedItem.nombre;
          if (!row[4] || Number(row[4]) === 0) row[4] = matchedItem.precioVenta;
          if (!row[6]) row[6] = true;
          modified = true;
        }
      }
    }

    if (modified) {
      range.setValues(values);
    }
  } catch (err) {
    console.warn("healProductsSheet warning:", err);
  }
}

function seedMenuIfEmpty_(motelId: string, user: FemaUser): void {
  healProductsSheet_(motelId);

  const existing = readRows_(FEMA_CONFIG.sheets.products)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === motelId && isRowActive_(row.Activo));
  if (existing.length > 0) return;

  const now = now_().toISOString();
  DEFAULT_MENU_ITEMS.forEach((item) => {
    const prodId = newId_("PRD");
    appendRow_(FEMA_CONFIG.sheets.products, {
      IdProducto: prodId,
      IdMotel: motelId,
      Categoria: item.categoria,
      Categoría: item.categoria,
      Nombre: item.nombre,
      Producto: item.nombre,
      NombreProducto: item.nombre,
      PrecioVenta: item.precioVenta,
      CostoUnitario: 0,
      Activo: true,
      CreadoEn: now
    });
    appendRow_(FEMA_CONFIG.sheets.inventory, {
      IdInventario: newId_("INV"),
      IdMotel: motelId,
      IdProducto: prodId,
      StockBodega: 10,
      StockAnaquel: 5,
      ActualizadoEn: now
    });
  });
}

function getProductsAndInventory_(user: FemaUser): ProductInventoryItem[] {
  seedMenuIfEmpty_(user.idMotel, user);
  healProductsSheet_(user.idMotel);

  const products = readRows_(FEMA_CONFIG.sheets.products)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === user.idMotel && isRowActive_(row.Activo));

  const inventoryMap = new Map<string, SheetRow>();
  readRows_(FEMA_CONFIG.sheets.inventory)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === user.idMotel)
    .forEach((row) => inventoryMap.set(String(row.IdProducto), row));

  return products.map((prod, idx) => {
    const pId = String(prod.IdProducto);
    const inv = inventoryMap.get(pId);
    const stockBodega = Number(inv?.StockBodega ?? 0) || 0;
    const stockAnaquel = Number(inv?.StockAnaquel ?? 0) || 0;

    let nombre = String(prod.Nombre || prod.Producto || prod.NombreProducto || prod["Nombre del Producto"] || prod.Descripcion || "").trim();
    let categoria = String(prod.Categoria || prod["Categoría"] || prod.Tipo || "").trim().toUpperCase();

    if (!nombre || nombre === "undefined" || nombre === "null") {
      if (idx < DEFAULT_MENU_ITEMS.length) {
        nombre = DEFAULT_MENU_ITEMS[idx].nombre;
        if (!categoria || categoria === "GENERAL") categoria = DEFAULT_MENU_ITEMS[idx].categoria;
      } else {
        nombre = `PRODUCTO ${pId}`;
      }
    }
    if (!categoria || categoria === "GENERAL") {
      categoria = (idx < DEFAULT_MENU_ITEMS.length) ? DEFAULT_MENU_ITEMS[idx].categoria : "GENERAL";
    }

    return {
      idProducto: pId,
      idMotel: String(prod.IdMotel),
      categoria,
      nombre,
      precioVenta: Number(prod.PrecioVenta || prod.Precio || 0) || 0,
      costoUnitario: Number(prod.CostoUnitario || 0) || 0,
      activo: isRowActive_(prod.Activo),
      stockBodega,
      stockAnaquel,
      stockTotal: stockBodega + stockAnaquel
    };
  }).sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre));
}

function getOccupiedRoomsForSale_(user: FemaUser): OccupiedRoomOption[] {
  const rooms = readRows_(FEMA_CONFIG.sheets.rooms)
    .filter((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel && isRowActive_(r.Activo) && String(r.EstadoActual) === "OCUPADA" && r.IdCicloActual);

  const roomTypes = new Map(
    readRows_(FEMA_CONFIG.sheets.roomTypes)
      .filter((t) => !isExampleRow_(t))
      .map((t) => [String(t.IdTipo), String(t.NombreTipo)])
  );

  const activeStays = new Map(
    readRows_(FEMA_CONFIG.sheets.stays)
      .filter((s) => !isExampleRow_(s) && String(s.EstadoEstancia) === "ACTIVA")
      .map((s) => [String(s.IdCiclo), s])
  );

  return rooms.map((room) => {
    const cycleId = String(room.IdCicloActual);
    const stay = activeStays.get(cycleId);
    return {
      idHabitacion: String(room.IdHabitacion),
      numeroHabitacion: String(room.NumeroHabitacion),
      tipoHabitacion: roomTypes.get(String(room.IdTipo)) || "General",
      idEstancia: stay ? String(stay.IdEstancia) : "",
      precioFinal: stay ? Number(stay.PrecioFinal) || 0 : 0
    };
  }).sort((a, b) => Number(a.numeroHabitacion) - Number(b.numeroHabitacion));
}

function saveProduct_(user: FemaUser, input: SaveProductInput): { id: string } {
  const nombre = String(input.nombre || "").trim();
  const categoria = String(input.categoria || "").trim().toUpperCase();
  const precioVenta = Number(input.precioVenta);
  const costoUnitario = Number(input.costoUnitario || 0);

  if (!nombre) throw new Error("El nombre del producto es obligatorio.");
  if (!categoria) throw new Error("La categoría del producto es obligatoria.");
  if (isNaN(precioVenta) || precioVenta < 0) throw new Error("El precio de venta debe ser mayor o igual a 0.");

  return withScriptLock_(() => {
    const now = now_().toISOString();
    if (input.idProducto) {
      const prod = requireRowById_(FEMA_CONFIG.sheets.products, "IdProducto", input.idProducto);
      updateRowById_(FEMA_CONFIG.sheets.products, "IdProducto", input.idProducto, {
        Nombre: nombre,
        Categoria: categoria,
        PrecioVenta: precioVenta,
        CostoUnitario: costoUnitario
      });
      writeAudit_(user, "MODIFICAR_PRODUCTO", "PRODUCTO", input.idProducto, prod, {
        Nombre: nombre,
        Categoria: categoria,
        PrecioVenta: precioVenta
      }, "Modificación de producto", "INVENTARIO");
      return { id: input.idProducto };
    }

    const newProdId = newId_("PRD");
    appendRow_(FEMA_CONFIG.sheets.products, {
      IdProducto: newProdId,
      IdMotel: user.idMotel,
      Categoria: categoria,
      Categoría: categoria,
      Nombre: nombre,
      Producto: nombre,
      NombreProducto: nombre,
      PrecioVenta: precioVenta,
      CostoUnitario: costoUnitario,
      Activo: true,
      CreadoEn: now
    });

    const bodegaInit = Number(input.stockBodegaInicial || 0);
    const anaquelInit = Number(input.stockAnaquelInicial || 0);
    appendRow_(FEMA_CONFIG.sheets.inventory, {
      IdInventario: newId_("INV"),
      IdMotel: user.idMotel,
      IdProducto: newProdId,
      StockBodega: bodegaInit,
      StockAnaquel: anaquelInit,
      ActualizadoEn: now
    });

    if (bodegaInit > 0 || anaquelInit > 0) {
      appendRow_(FEMA_CONFIG.sheets.inventoryMovements, {
        IdMovimiento: newId_("MOV"),
        IdMotel: user.idMotel,
        IdProducto: newProdId,
        TipoMovimiento: "ENTRADA",
        Origen: "ALTA_INICIAL",
        Destino: "INVENTARIO_INICIAL",
        Cantidad: bodegaInit + anaquelInit,
        StockBodegaDespues: bodegaInit,
        StockAnaquelDespues: anaquelInit,
        Motivo: "Stock inicial al dar de alta el producto",
        IdTurno: "",
        IdEstancia: "",
        IdUsuario: user.idUsuario,
        FechaHora: now
      });
    }

    writeAudit_(user, "CREAR_PRODUCTO", "PRODUCTO", newProdId, null, {
      Nombre: nombre,
      Categoria: categoria,
      PrecioVenta: precioVenta
    }, "Alta de producto nuevo", "INVENTARIO");
    return { id: newProdId };
  });
}

function transferInventory_(user: FemaUser, input: TransferInventoryInput): void {
  const qty = Number(input.cantidad);
  if (isNaN(qty) || qty <= 0) throw new Error("La cantidad a traspasar debe ser mayor a 0.");

  return withScriptLock_(() => {
    const invRow = readRows_(FEMA_CONFIG.sheets.inventory)
      .find((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel && String(r.IdProducto) === input.idProducto);
    if (!invRow) throw new Error("Registro de inventario no encontrado.");

    let currentBodega = Number(invRow.StockBodega || 0);
    let currentAnaquel = Number(invRow.StockAnaquel || 0);

    let newBodega = currentBodega;
    let newAnaquel = currentAnaquel;
    let origen = "";
    let destino = "";

    if (input.direccion === "BODEGA_A_ANAQUEL") {
      if (currentBodega < qty) {
        throw new Error(`Stock insuficiente en Bodega (${currentBodega} disponibles, solicitados ${qty}).`);
      }
      newBodega = currentBodega - qty;
      newAnaquel = currentAnaquel + qty;
      origen = "BODEGA";
      destino = "ANAQUEL";
    } else if (input.direccion === "ANAQUEL_A_BODEGA") {
      if (currentAnaquel < qty) {
        throw new Error(`Stock insuficiente en Anaquel (${currentAnaquel} disponibles, solicitados ${qty}).`);
      }
      newAnaquel = currentAnaquel - qty;
      newBodega = currentBodega + qty;
      origen = "ANAQUEL";
      destino = "BODEGA";
    } else {
      throw new Error("Dirección de traspaso no válida.");
    }

    const now = now_().toISOString();
    updateRowById_(FEMA_CONFIG.sheets.inventory, "IdInventario", String(invRow.IdInventario), {
      StockBodega: newBodega,
      StockAnaquel: newAnaquel,
      ActualizadoEn: now
    });

    appendRow_(FEMA_CONFIG.sheets.inventoryMovements, {
      IdMovimiento: newId_("MOV"),
      IdMotel: user.idMotel,
      IdProducto: input.idProducto,
      TipoMovimiento: input.direccion === "BODEGA_A_ANAQUEL" ? "TRASPASO_A_ANAQUEL" : "TRASPASO_A_BODEGA",
      Origen: origen,
      Destino: destino,
      Cantidad: qty,
      StockBodegaDespues: newBodega,
      StockAnaquelDespues: newAnaquel,
      Motivo: input.motivo ? String(input.motivo).trim() : `Traspaso de ${origen} a ${destino}`,
      IdTurno: "",
      IdEstancia: "",
      IdUsuario: user.idUsuario,
      FechaHora: now
    });

    writeAudit_(user, "TRASPASO_INVENTARIO", "INVENTARIO", String(invRow.IdInventario), invRow, {
      StockBodega: newBodega,
      StockAnaquel: newAnaquel,
      Cantidad: qty,
      Direccion: input.direccion
    }, input.motivo || `Traspaso de ${origen} a ${destino}`, "INVENTARIO");
  });
}

function adjustInventory_(user: FemaUser, input: AdjustInventoryInput): void {
  const nuevoStock = Number(input.nuevoStock);
  const motivo = String(input.motivo || "").trim();
  if (isNaN(nuevoStock) || nuevoStock < 0) throw new Error("El nuevo stock no puede ser negativo.");
  if (!motivo) throw new Error("El motivo de la corrección o ajuste es obligatorio.");

  return withScriptLock_(() => {
    const invRow = readRows_(FEMA_CONFIG.sheets.inventory)
      .find((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel && String(r.IdProducto) === input.idProducto);
    if (!invRow) throw new Error("Registro de inventario no encontrado.");

    let currentBodega = Number(invRow.StockBodega || 0);
    let currentAnaquel = Number(invRow.StockAnaquel || 0);

    let newBodega = currentBodega;
    let newAnaquel = currentAnaquel;
    let diff = 0;

    if (input.ubicacion === "BODEGA") {
      diff = nuevoStock - currentBodega;
      newBodega = nuevoStock;
    } else if (input.ubicacion === "ANAQUEL") {
      diff = nuevoStock - currentAnaquel;
      newAnaquel = nuevoStock;
    } else {
      throw new Error("Ubicación no válida para ajuste (debe ser BODEGA o ANAQUEL).");
    }

    const now = now_().toISOString();
    updateRowById_(FEMA_CONFIG.sheets.inventory, "IdInventario", String(invRow.IdInventario), {
      StockBodega: newBodega,
      StockAnaquel: newAnaquel,
      ActualizadoEn: now
    });

    appendRow_(FEMA_CONFIG.sheets.inventoryMovements, {
      IdMovimiento: newId_("MOV"),
      IdMotel: user.idMotel,
      IdProducto: input.idProducto,
      TipoMovimiento: "AJUSTE",
      Origen: input.ubicacion,
      Destino: "CORRECCION_FISICA",
      Cantidad: diff,
      StockBodegaDespues: newBodega,
      StockAnaquelDespues: newAnaquel,
      Motivo: motivo,
      IdTurno: "",
      IdEstancia: "",
      IdUsuario: user.idUsuario,
      FechaHora: now
    });

    writeAudit_(user, "AJUSTE_INVENTARIO", "INVENTARIO", String(invRow.IdInventario), invRow, {
      Ubicacion: input.ubicacion,
      NuevoStock: nuevoStock,
      Diferencia: diff,
      Motivo: motivo
    }, motivo, "INVENTARIO");
  });
}

function registerSaleToRoom_(user: FemaUser, input: RegisterSaleInput): RegisterSaleResult {
  if (!input.items || !input.items.length) throw new Error("Debe agregar al menos un producto a la venta.");

  return withScriptLock_(() => {
    const shift = requireOpenShiftForUser_(user);
    const shiftId = String(shift.IdTurno);

    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel) {
      throw new Error("Habitación no encontrada.");
    }
    if (String(room.EstadoActual) !== "OCUPADA" || !room.IdCicloActual) {
      throw new Error("La habitación seleccionada no está OCUPADA actualmente.");
    }

    const cycleId = String(room.IdCicloActual);
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((r) =>
      !isExampleRow_(r) && String(r.IdCiclo) === cycleId && String(r.EstadoEstancia) === "ACTIVA"
    );
    if (!stay) throw new Error("No se encontró la estancia activa para esta habitación.");
    const stayId = String(stay.IdEstancia);

    const products = readRows_(FEMA_CONFIG.sheets.products)
      .filter((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel);
    const productMap = new Map(products.map((p) => [String(p.IdProducto), p]));

    const inventories = readRows_(FEMA_CONFIG.sheets.inventory)
      .filter((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel);
    const inventoryMap = new Map(inventories.map((inv) => [String(inv.IdProducto), inv]));

    // 1. Validar que todos los items existan y tengan stock suficiente en Anaquel
    let totalSale = 0;
    let totalItems = 0;
    const verifiedItems: Array<{ prod: SheetRow; inv: SheetRow; qty: number; subtotal: number }> = [];

    input.items.forEach((item) => {
      const qty = Number(item.cantidad);
      if (isNaN(qty) || qty <= 0) throw new Error("La cantidad debe ser al menos 1.");
      const prod = productMap.get(item.idProducto);
      if (!prod) throw new Error(`Producto ${item.idProducto} no encontrado.`);
      const inv = inventoryMap.get(item.idProducto);
      if (!inv) throw new Error(`Inventario para ${prod.Nombre} no encontrado.`);

      const stockAnaquel = Number(inv.StockAnaquel || 0);
      if (stockAnaquel < qty) {
        throw new Error(`Stock insuficiente en Anaquel para "${prod.Nombre}" (${stockAnaquel} disponibles, solicitados ${qty}).`);
      }

      const price = Number(prod.PrecioVenta || 0);
      const subtotal = price * qty;
      totalSale += subtotal;
      totalItems += qty;
      verifiedItems.push({ prod, inv, qty, subtotal });
    });

    const now = now_().toISOString();
    const cargoId = newId_("CRG");

    // 2. Descontar de anaquel y registrar movimientos
    verifiedItems.forEach(({ prod, inv, qty, subtotal }) => {
      const pId = String(prod.IdProducto);
      const curBodega = Number(inv.StockBodega || 0);
      const curAnaquel = Number(inv.StockAnaquel || 0);
      const newAnaquel = curAnaquel - qty;

      updateRowById_(FEMA_CONFIG.sheets.inventory, "IdInventario", String(inv.IdInventario), {
        StockAnaquel: newAnaquel,
        ActualizadoEn: now
      });

      appendRow_(FEMA_CONFIG.sheets.inventoryMovements, {
        IdMovimiento: newId_("MOV"),
        IdMotel: user.idMotel,
        IdProducto: pId,
        TipoMovimiento: "VENTA",
        Origen: "ANAQUEL",
        Destino: `HABITACION_${room.NumeroHabitacion}`,
        Cantidad: qty,
        StockBodegaDespues: curBodega,
        StockAnaquelDespues: newAnaquel,
        Motivo: `Venta cargada a habitación ${room.NumeroHabitacion}`,
        IdTurno: shiftId,
        IdEstancia: stayId,
        IdUsuario: user.idUsuario,
        FechaHora: now
      });

      appendRow_(FEMA_CONFIG.sheets.charges, {
        IdCargo: newId_("CRG"),
        IdEstancia: stayId,
        IdTurno: shiftId,
        TipoCargo: "PRODUCTO",
        Descripcion: `${prod.Nombre} (x${qty})`,
        Cantidad: qty,
        PrecioUnitario: Number(prod.PrecioVenta || 0),
        Total: subtotal,
        FechaHora: now,
        IdUsuario: user.idUsuario,
        Estado: input.cobrarInmediato ? "COBRADO" : "PENDIENTE"
      });
    });

    // 3. Si se cobra de inmediato, registrar el pago en Pagos
    if (input.cobrarInmediato) {
      appendRow_(FEMA_CONFIG.sheets.payments, {
        IdPago: newId_("PAG"),
        IdEstancia: stayId,
        IdTurno: shiftId,
        FechaHora: now,
        FormaPago: input.formaPago || "EFECTIVO",
        Monto: totalSale,
        Referencia: `VENTA_PRODUCTOS_HAB_${room.NumeroHabitacion}`,
        IdUsuario: user.idUsuario,
        Estado: "APLICADO"
      });
    }

    writeAudit_(user, "VENTA_PRODUCTOS", "CARGO", cargoId, null, {
      IdHabitacion: input.idHabitacion,
      NumeroHabitacion: room.NumeroHabitacion,
      IdEstancia: stayId,
      Total: totalSale,
      ItemsVendidos: totalItems,
      CobradoInmediato: input.cobrarInmediato,
      FormaPago: input.formaPago || "N/A"
    }, `Venta de productos a habitación ${room.NumeroHabitacion}`, "INVENTARIO");

    return {
      idCargo: cargoId,
      total: totalSale,
      habitacion: String(room.NumeroHabitacion),
      itemsVendidos: totalItems
    };
  });
}

function getInventoryMovements_(user: FemaUser): InventoryMovementRecord[] {
  const products = readRows_(FEMA_CONFIG.sheets.products)
    .filter((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel);
  const productMap = new Map(products.map((p) => [String(p.IdProducto), p]));

  const movements = readRows_(FEMA_CONFIG.sheets.inventoryMovements)
    .filter((r) => !isExampleRow_(r) && String(r.IdMotel) === user.idMotel);

  return movements.map((m) => {
    const prod = productMap.get(String(m.IdProducto));
    return {
      idMovimiento: String(m.IdMovimiento),
      idMotel: String(m.IdMotel),
      idProducto: String(m.IdProducto),
      nombreProducto: prod ? String(prod.Nombre) : "Producto",
      categoria: prod ? String(prod.Categoria) : "GENERAL",
      tipoMovimiento: String(m.TipoMovimiento) as any,
      origen: String(m.Origen || ""),
      destino: String(m.Destino || ""),
      cantidad: Number(m.Cantidad) || 0,
      stockBodegaDespues: Number(m.StockBodegaDespues) || 0,
      stockAnaquelDespues: Number(m.StockAnaquelDespues) || 0,
      motivo: String(m.Motivo || ""),
      idTurno: String(m.IdTurno || ""),
      idEstancia: String(m.IdEstancia || ""),
      idUsuario: String(m.IdUsuario || ""),
      fechaHora: String(m.FechaHora || "")
    };
  }).reverse().slice(0, 100);
}
