# FEMA-UPD-23 — Ensayo local de transición y recuperación

**Fase:** F8 — ensayo de compatibilidad y CHECK
**Resultado:** PASS en almacenamiento local temporal con fixtures sintéticos.
**Alcance:** demostrar preservación aditiva y dejar un procedimiento revisable; no cambia la aplicación ni los servicios externos.

## Evidencia del ensayo

Ejecutado desde la raíz del repositorio con:

```bash
node local/schema-transition-rehearsal.mjs
```

El arnés usa los encabezados v1 declarados localmente y crea un almacén JSON temporal bajo el directorio privado del sistema. No lee credenciales, no abre conexiones de red y elimina tanto el almacén como el respaldo al terminar. Los importes de la fixture son valores sintéticos para comparación; no son tarifas FEMA ni se copian a campos nuevos.

| Comprobación | Resultado observado |
|---|---|
| Primera pasada | Añadió 14 columnas y creó 5 hojas propuestas. |
| Segunda pasada | 0 escrituras; encabezados, filas e IDs permanecieron idénticos a la primera pasada. |
| Filas / IDs v1 | 23 → 23 filas; 23 → 23 IDs, con la misma lista y multiplicidad. |
| Pagos sintéticos | 1,250 centavos antes y después; ambos registros quedaron sin cambios. |
| Estados activos | La habitación ocupada que cruza de `SYN-TURNO-A` a `SYN-TURNO-B`, la habitación en `LIMPIEZA` y la limpieza `EN_PROCESO` conservaron estado y vínculos. |
| Columnas v2 en filas v1 | Se mantuvieron vacías; no hubo backfill ni reconstrucción de snapshots. |
| Fallo y recuperación | Tras inyectar fallo en la cuarta escritura local, se restauró el respaldo de la fixture y la comparación con el estado inicial fue exacta. |
| Hallazgos | Permanecieron en la lista de resolución: ID duplicado sintético en `Bitacora`, referencias sintéticas faltantes a ciclo/tarifa y diferencia sintética de 1 centavo entre `PrecioFinal` y pagos registrados. No se corrigieron. |

El script también verifica que un encabezado duplicado detenga el preflight antes de escribir. El resultado demuestra únicamente compatibilidad del contrato propuesto con este fixture; no demuestra que el libro operativo tenga esos encabezados o filas.

## Secuencia revisable para una futura operación autorizada

La secuencia se deriva del contrato propuesto en [FEMA-UPD-03](FEMA_UPD03_SCHEMA_RECOVERY.md). FEMA-UPD-01 y FEMA-UPD-02 continúan siendo prerrequisitos: sus reglas no se deben inferir de este ensayo.

1. **Cerrar entradas y destino.** Aceptar las reglas pendientes de FEMA-UPD-01/02; identificar el libro, proyecto Apps Script, hotel y responsable exactos. Leer el esquema real sin escribirlo. Comparar cabeceras existentes en orden, filas de encabezado, columnas repetidas, pestañas ausentes y columnas que ya coincidan con v2. Si el destino o el esquema no coinciden con lo revisado, parar.
2. **Respaldar de forma privada.** Con autorización específica para el destino, generar una copia privada del libro completo, restringirla al personal autorizado y registrar de forma privada su identificador, fecha/hora, propietario, permisos, pestañas y conteos. No guardar exportaciones, filas, IDs personales ni credenciales en Git, logs o este documento. Verificar que la copia se puede abrir y que su integridad corresponde al origen.
3. **Ensayar restauración aislada.** Restaurar esa copia en un libro de prueba separado y privado, nunca sobre el libro operativo. Comparar encabezados, filas, IDs, duplicados, referencias, estados, registros de pagos y sumas registradas. Conciliar por separado fórmulas y fotografías/cortes; no recrear snapshots históricos desde el estado actual. Si la restauración no reproduce la copia, no continuar.
4. **Registrar discrepancias antes de mutar.** Elaborar una lista con hoja, ID no sensible o referencia interna protegida, campo, diferencia, evidencia y responsable de resolución. Distinguir error verificable, dato faltante y dato no reconstruible. No importar precios ilustrativos ni completar valores históricos a partir del catálogo actual. No deduplicar ni cambiar referencias automáticamente.
5. **Aplicar sólo el delta aditivo en la copia aislada.** Agregar a la derecha únicamente las cabeceras aprobadas que falten y crear las hojas nuevas con sus cabeceras. Conservar nombres, orden y valores de columnas existentes; no borrar, renombrar, mover ni completar filas de legado. No crear asignaciones usuario-hotel o parámetros de habitación hasta tener conciliación manual aprobada.
6. **Repetir y comparar.** Ejecutar la misma preparación otra vez y demostrar que no añade cabeceras, hojas ni filas adicionales. Comparar conteos, multiconjuntos de IDs, duplicados, relaciones, estados por habitación/ciclo/turno, pagos y sumas antes/después. Las diferencias monetarias y de legado/catálogo deben continuar en la lista de resolución, sin autocorrección.
7. **Preparar la capa de aplicación por separado.** Sólo después de aceptar la copia aislada, comprobar que la versión de servicio hace preflight de todas las cabeceras antes de cualquier escritura. Resolver previamente los escritores actuales que puedan cambiar `Pagos.Monto`; no activar operaciones v2 si ese comportamiento sigue habilitado. Validar FEMA-UPD-01/02, permisos, turno, journal e idempotencia en su propia ronda. Esta fase no autoriza `clasp push`, despliegue ni activación.
8. **Solicitar autorización de ejecución y corte.** Presentar destino, comparación, lista de discrepancias, evidencia de restauración, versión del código y pasos exactos. Sólo una autorización explícita posterior puede cubrir las escrituras en el destino real. Tras esa aprobación, mantener la copia de respaldo, verificar conteos/IDs/estados y detener las escrituras afectadas ante cualquier divergencia o estado parcial.

## Requisitos del respaldo y restauración

- La copia debe incluir todas las pestañas, sus datos y fórmulas, encabezados, formatos funcionales y configuraciones que se hayan declarado parte del alcance; conservarla fuera del control de versiones y con acceso mínimo.
- Probar apertura y restauración en una copia aislada antes de tratar el respaldo como recuperable. Registrar conteos y un manifiesto privado de integridad; no incluir datos personales en la evidencia versionada.
- Una restauración no se debe copiar sobre la operación real a ciegas: el origen puede haber recibido nuevas operaciones después del respaldo. Restaurar primero a un libro separado, comparar cambios posteriores y conciliar. Reemplazar un destino operativo requiere autorización separada y un plan explícito de preservación de cambios posteriores.
- El respaldo de código o un commit no respalda los datos del libro; las copias de datos tampoco sustituyen el control de versiones del código.

## Puntos de parada

- La conexión, URL, `spreadsheetId`, cuenta o comando apunta al libro operativo sin autorización específica, o se detectan datos personales fuera del entorno autorizado.
- FEMA-UPD-01/02 siguen sin cerrar una regla necesaria para el dato que se pretende modificar, o la secuencia/campos difieren del contrato revisado.
- No se puede crear, abrir o restaurar una copia privada; conteos, IDs o hashes de la copia no concuerdan.
- Hay cabeceras duplicadas, cabeceras desconocidas que cambian la interpretación, pestañas/campos faltantes no incluidos en el plan, IDs duplicados o referencias inválidas sin disposición aprobada.
- Estados activos, historia, pagos, sumas, conteos o relaciones cambian fuera del delta de cabeceras; aparece un backfill o una reconstrucción automática.
- La segunda pasada crea estructuras/datos adicionales, una escritura queda parcial o el preflight de la aplicación no falla de forma cerrada.
- Persisten discrepancias monetarias o legado/catálogo sin resolución humana; no se despliega ni habilita escritura v2 para ese alcance.

## Límites y estado

- El esquema real de Google Sheets no se verificó y esta ejecución no lo consultó ni modificó.
- Apps Script, Docker, GitHub, Vercel y Producción no se usaron como destino de datos ni se modificaron por este ensayo.
- No se importaron precios, no se completaron columnas históricas y no se reconstruyeron snapshots antiguos.
- El resultado es local y sintético; no cierra FEMA-007 ni autoriza migración, sincronización, publicación o despliegue.
