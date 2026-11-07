# Requisitos y planeación de FEMA

Estado: borrador en levantamiento de requisitos. Este documento registra el objetivo expresado por el usuario y las decisiones aún abiertas; no representa funcionalidad implementada ni arquitectura aprobada.

## Visión del producto

FEMA evolucionará desde el control de habitaciones hacia un sistema administrativo completo para uno o varios moteles. Se desea usar `fema.integratech.app` como domicilio de acceso, con Vercel como parte del enrutamiento o alojamiento por definir.

## Alcance objetivo inicial

### Organización y usuarios

- FEMA opera actualmente dos hoteles.
- Gerencia y auxiliar de gerencia dan servicio a ambos hoteles.
- Recepción y limpieza tienen personal propio por hotel.
- Perfiles de acceso expresamente mencionados: dueño, gerencia, auxiliar de gerencia, recepción y constructor/desarrollador del sistema.
- El constructor requiere acceso FULL a todo el sistema.
- Se requiere un panel de permisos donde se seleccione un perfil y se marquen con casillas los permisos que tendrá. Los perfiles y sus permisos deben poder cambiar; no se quiere una matriz rígida incorporada al sistema.
- A cada persona se le asignará un perfil. Todas las personas que compartan perfil tendrán los mismos permisos configurados para ese perfil.
- Gerencia tendrá acceso administrativo completo como perfil inicial y podrá administrar perfiles y permisos. El constructor también podrá administrar el panel de permisos y conserva el acceso FULL requerido.
- El perfil del dueño se orientará principalmente a consultar métricas y reportes; no se debe asumir que necesita administrar el sistema. Los informes concretos y si se presentan por hotel o consolidados están pendientes de definir.
- El perfil inicial de auxiliar requiere acceso a inventario, alta de productos, entradas de mercancía, ajustes y movimientos de almacén a anaquel; podrá consultar el dashboard de habitaciones y los cortes, pero no gestionar habitaciones. Sus permisos podrán ajustarse desde el panel.
- El perfil inicial de recepción requiere gestionar el flujo operativo de habitaciones, generar ventas y consultar el reporte de corte. Sus permisos podrán ajustarse desde el panel.
- El personal de limpieza no usará el sistema; no requiere cuenta de acceso.
- Falta definir el nivel de detalle de cada permiso (módulo/acción) y los reportes disponibles para el dueño.

### Identidad y acceso

- Se requieren usuarios y contraseñas propios, creados por un administrador desde el sistema.
- En el primer inicio de sesión se exigirá cambiar la contraseña.
- Para restablecer acceso, el sistema generará un PIN temporal de seis dígitos; al usarlo, la persona deberá definir una contraseña propia antes de continuar.
- Quedan por definir la vigencia del PIN, su entrega al usuario, el límite de intentos y quién puede solicitar o ejecutar el restablecimiento.

### Domicilio y plataforma deseados

- La aplicación completa debe operar bajo `fema.integratech.app`.
- La base operativa actual en Google Sheets y el uso de Apps Script se mantienen como punto de partida.
- Se podrá estudiar otra tecnología o lenguaje si ofrece ventajas para operar la aplicación completa bajo el dominio; todavía no hay decisión aprobada de migrar el stack.

### Catálogos

- Hoteles.
- Habitaciones.
- Roles.
- Personal.
- Perfiles para administrar privilegios de acceso y uso.
- Tipos de habitación.
- Costos de habitación.

La relación entre roles, perfiles, usuarios y privilegios sigue pendiente de definición.

#### Tarifas

- Las opciones se definen por hotel, tipo de habitación y cantidad de horas. Una habitación obtiene las opciones que corresponden a su hotel y tipo.
- Cada opción tiene una cantidad de horas y un precio preconfigurados; ejemplo ilustrativo para una habitación sencilla: 6 horas por $430, 7 horas por $450, 8 horas por $650.
- El nombre correcto del campo monetario es **Precio**. “Tarifa” se considera una etiqueta de diseño incorrecta para ese campo.
- Campos funcionales requeridos: hotel, tipo de habitación, horas, precio y estado; las personas incluidas, configurables por habitación, se cargan previamente.
- Las opciones de horas/precio configuradas se reutilizan al entrar y al extender; recepción selecciona la duración en el flujo de ocupación, pero no escribe el precio manualmente.

### Habitaciones

El ciclo operativo propuesto es:

`Disponible → Ocupada → Sucia → Limpiando → Disponible`

Cada estado tendrá características, acciones permitidas, datos requeridos y reglas propias. Esos detalles se levantarán antes de fijar los criterios de aceptación.

#### Entrada: Disponible → Ocupada

- No se registra la identidad del huésped y no se manejan reservaciones.
- Desde el tablero de habitaciones, recepción selecciona una habitación disponible e inicia el registro de ocupación.
- Se abre un panel donde recepción selecciona las horas disponibles para ese hotel y tipo de habitación. El sistema carga el precio configurado y la cantidad de personas incluidas para esa habitación; recepción no captura ni modifica manualmente esos valores.
- El panel solicita marca/modelo o medio de llegada, placas y forma de pago. Los datos deben quedar completos incluso cuando el huésped llega caminando o en taxi.
- Marca/modelo se captura como texto escrito o seleccionado entre sugerencias de registros anteriores; no se mantendrá una lista cerrada de todas las marcas/modelos posibles.
- Si el huésped llega caminando o en taxi, se identifica ese medio de llegada y se registra **“No aplica”** en placas. Las placas para vehículos se capturan como texto.
- Formas de pago confirmadas: efectivo y tarjeta.
- La habitación se cobra completa al entrar. No se permiten abonos. El estado se marca Ocupada al registrar que el huésped tomó la habitación.
- La ocupación incluye dos personas. La cantidad incluida debe poder configurarse por habitación.
- Durante el registro de ocupación, recepción puede usar un botón para agregar personas extra; también puede agregarlas después durante la estancia. Cada persona adicional tiene un costo configurado como propiedad de esa habitación. El cargo se cobra al registrarlo, se indica la forma de pago y se agrega al detalle de la habitación para consultar el desglose.
- Falta definir cómo se visualiza el historial de altas de personas adicionales.
- Se permite extender la estancia agregando otro período previamente establecido, con su precio configurado (por ejemplo, seis horas por la tarifa fijada para seis horas). El cargo se registra al extender.
- Cada operación de extensión agrega un solo período predefinido a la hora de salida vigente. No se agregan varios períodos en una sola operación, pero se permiten varias extensiones secuenciales durante una estancia.
- Ejemplo acordado: una estancia de seis horas puede extenderse con otro período de seis horas y su precio, para llevar la salida prevista a doce horas desde la entrada.
- El tiempo de salida se amplía según la duración agregada.
- Cada extensión debe conservarse como detalle de la habitación para consultar su desglose; registrar el período agregado, precio y forma de pago.
- La salida la registra manualmente recepción. Al vencer la hora prevista, el tablero debe mostrar una alerta visual (color o aviso); el sistema no dará salida ni cambiará automáticamente el estado de la habitación.
- Si el huésped sale después de la hora prevista sin extender, sólo queda el aviso de retraso; no se cobra tiempo adicional.
- Al registrar la salida, recepción puede agregar observaciones opcionales. No se muestra importe, resumen ni solicitud de pago en ese momento.
- Falta definir cómo se visualiza el historial de varias extensiones y si existe una regla distinta de pago para extensiones (se asume efectivo o tarjeta, según las formas generales definidas).

#### Limpieza: Sucia → Limpiando → Disponible

- Al registrar la salida, la habitación pasa a Sucia y permanece así hasta que el personal de limpieza entra físicamente a atenderla.
- Recepción controla el inicio: cuando el personal entra, selecciona quién ingresó y marca que comienza la limpieza. En ese momento la habitación pasa a Limpiando y empieza a contabilizarse el tiempo.
- Mientras está Limpiando, el tablero muestra cuánto tiempo lleva en proceso.
- Recepción marca “Finalizar limpieza”; el sistema registra el fin y la duración, y pasa la habitación automáticamente a Disponible.
- El personal de limpieza no inicia sesión ni marca sus propias acciones.
- Una persona de limpieza sólo puede tener una habitación en proceso de limpieza a la vez.

### Ventas e inventarios

Se requiere un módulo de ventas con productos e inventarios. Las existencias y operaciones de inventario serán independientes por hotel. Gerencia consultará el inventario por hotel, sin consolidarlo entre hoteles. Se requiere catálogo configurable de bodegas y anaqueles; normalmente habrá una bodega y un anaquel por hotel, pero el catálogo permitirá registrar más.

El auxiliar podrá registrar entradas de mercancía con producto, cantidad, costo unitario y número de factura o nota; realizar ajustes de existencias con anotación obligatoria del motivo; y mover mercancía de bodega a anaquel. Faltan por definir ventas, cobros, devoluciones y reglas detalladas de auditoría.

### Turnos y cortes

Cada turno de recepción debe generar un corte propio. Al abrirlo, se carga el estado actual de las habitaciones. Al cerrarlo, se guarda una fotografía del estado de las habitaciones al momento del corte; ese estado se conserva para el siguiente corte y las habitaciones no se reinician.

El corte cerrado debe conservarse aunque quien lo cerró termine su sesión. El usuario saliente necesita revisar y cotejar su corte mientras el usuario entrante abre un nuevo turno y registra operaciones. Las operaciones nuevas se atribuyen al nuevo turno; el corte anterior queda disponible para consulta de sólo lectura durante el cotejo.

Cada operación debe quedar asociada tanto a la cuenta autenticada que la realizó como al turno/corte en que ocurrió. El perfil sólo determina permisos; no identifica quién hizo la operación. Si varias personas comparten perfil, sus movimientos y cortes permanecen asociados a cada persona/turno, sin mezclarse por perfil.

Se distinguen dos conceptos que no deben depender uno del otro:

- **Sesión de acceso:** identifica a la persona que inició sesión en FEMA.
- **Turno/corte:** período operativo al que se asignan operaciones de recepción y cuyo estado de habitaciones se registra al abrir/cerrar.

La convivencia de dos personas en la misma computadora requiere definir sesiones autenticadas independientes y consulta de cortes cerrados sin reabrir su turno. Usar otro navegador o perfil de navegador puede servir como disposición operativa para mantener dos vistas abiertas, pero no sustituye que el corte esté guardado y autorizado en el sistema.

### Relevo de recepción: propuesta para validar

1. Recepción A cierra su corte; FEMA persiste las transacciones y el estado de las habitaciones en el punto de cierre.
2. El corte de A queda cerrado y disponible en modo consulta/cotejo. Sus acciones operativas quedan inhabilitadas.
3. Recepción B abre un turno nuevo. FEMA carga el estado vigente de las habitaciones, incluida la continuidad de habitaciones ocupadas, sucias o en limpieza.
4. Las operaciones posteriores al inicio del nuevo turno se registran bajo B/nuevo corte; no modifican los registros ni la fotografía del corte de A.
5. A puede continuar consultando el corte cerrado mientras B trabaja. Una ventana o perfil de navegador independiente puede mantener ambas sesiones visibles en la misma computadora.

Está pendiente definir cómo se registran diferencias de cotejo, quién puede ver cortes cerrados y si el cotejo tiene estados propios.

**Propuesta no aprobada para revisión:** separar cierre operativo y conciliación financiera. Al cerrar, el corte queda cerrado y pasa a “pendiente de cotejo”; se conserva el estado de las habitaciones en ese punto y el nuevo turno puede abrir de inmediato. Esto no bloquea el hotel ni las operaciones del turno nuevo. A termina la revisión en sólo lectura y lo marca “conciliado”. Si encuentra una diferencia, se registra un ajuste con motivo y responsable sin reescribir las operaciones originales. Falta confirmar quién puede conciliar y qué hacer cuando los importes no coinciden.

## Separación entre objetivo y estado actual

El código versionado actualmente cubre catálogos básicos, operación de habitaciones, limpieza, turnos y un reporte relacionado con el turno abierto. No se debe inferir que ventas, inventarios o cortes completos ya estén implementados. Consultar `PROJECT_STATE.md` y `TODO.md` para el inventario vigente de implementación y brechas.

En el flujo de entrada existente, el formulario solicita una tarifa, marca/modelo del vehículo, placas, personas extra y forma de pago; el servidor permite efectivo, tarjeta o transferencia y registra el pago completo. El objetivo es elegir las horas en el panel y cargar el precio asociado automáticamente, permitir agregar personas extra con un botón y ofrecer sólo efectivo o tarjeta. El catálogo actual guarda personas incluidas en la tarifa y precio de persona extra en el tipo de habitación; el objetivo pide configurar las personas incluidas y el costo de persona extra por habitación. La interfaz actual de tarifas muestra tarifa/nombre, hotel, tipo, duración, precio, personas incluidas, vigencia y estado; la etiqueta de importe deberá ser **Precio** y las opciones deberán corresponder a hotel + tipo de habitación + horas. El código calcula la salida prevista desde la duración de la tarifa, pero no se ha documentado un flujo específico de extensión que guarde cada período y su pago como detalle consultable de habitación. La acción actual para agregar personas solicita cantidad y observaciones, pero no forma de pago; además actualiza el importe de los pagos existentes en lugar de registrar un pago separado por el nuevo cargo. El objetivo requiere cobrar al agregar y conservar un detalle desglosado con su forma de pago. En la salida, el código ya permite observaciones opcionales y cambia la habitación a Sucia; sin embargo, muestra entrada, salida prevista e importe final en la confirmación, mientras que el objetivo no debe mostrar resumen ni pago al salir. El tablero actual muestra la salida prevista sin una alerta visual de retraso.

En limpieza, el código actual permite a un usuario operativo seleccionar personal de limpieza de su hotel desde una habitación Sucia. La asignación inicia la limpieza de inmediato y cambia la habitación a Limpiando; el usuario operativo puede finalizarla y devolverla a Disponible. El personal de limpieza no necesita iniciar sesión para este flujo. La tarjeta actual muestra la hora de inicio, pero no un contador de tiempo transcurrido en vivo; el objetivo requiere mostrar ese tiempo mientras sigue Limpiando. La asignación debe ocurrir cuando el personal realmente entra, para que la habitación permanezca Sucia mientras espera.

En recepción, el código actual permite un solo turno abierto por hotel y sólo su titular puede operar habitaciones. Al cerrar, se guarda el turno; sin embargo, la aplicación no tiene una vista para abrir y cotejar un corte cerrado y el siguiente turno no puede operar hasta que el anterior haya cerrado. Esto no cubre todavía el relevo con revisión simultánea descrito para FEMA.

## Decisiones pendientes de levantamiento

1. Definir el nivel de detalle de permisos y los módulos/acciones configurables.
2. Definir las métricas y reportes que verá el dueño, y si serán por hotel o consolidados.
3. Precisar cómo se administrará la identidad FULL del constructor.
4. Definir vigencia, entrega, límite de intentos y autorización para emitir el PIN temporal de recuperación.
5. Definir el detalle de movimientos bodega-anaquel, ventas, cobros, devoluciones y auditoría de inventario.
6. Definir cómo se visualiza el historial de personas extra.
7. Reglas operativas de los demás estados de habitación, turnos y cortes.

## Método de levantamiento

Para cada pantalla, estado y acción se registrarán: actor y permiso; condición previa; botón o evento; campos y validaciones; cambios de estado/datos; dinero o inventario afectado; mensajes de éxito/error; bitácora; concurrencia y casos de reversa; criterios observables de aceptación.
