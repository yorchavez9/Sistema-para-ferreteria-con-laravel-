# PLAN DE IMPLEMENTACIÓN DE REPORTES
## Sistema de Ferretería - Laravel 12 + React + DomPDF

---

## 📋 ANÁLISIS DEL PROYECTO

### Módulos Principales Identificados

1. **Ventas (Sales)** - Módulo crítico
   - Ventas al contado y crédito
   - Documentos: Facturas, Boletas, Notas de Venta
   - Pagos por cuotas
   - Estados: pendiente, pagado, anulado, cancelado

2. **Compras (Purchase Orders)** - Módulo crítico
   - Órdenes de compra
   - Control de recepción (total/parcial)
   - Estados: pendiente, parcial, recibido, cancelado

3. **Caja (Cash)** - Módulo crítico
   - Sesiones de caja
   - Movimientos de efectivo
   - Arqueos de caja
   - Control de diferencias

4. **Inventario (Inventory)** - Módulo importante
   - Stock por sucursal
   - Movimientos de inventario
   - Alertas de stock bajo
   - Valorización de inventario

5. **Clientes (Customers)** - Módulo importante
   - Historial de compras
   - Cuentas por cobrar
   - Análisis de clientes

6. **Proveedores (Suppliers)** - Módulo importante
   - Historial de compras
   - Cuentas por pagar

7. **Gastos (Expenses)** - Módulo importante
   - Gastos por categoría
   - Control de aprobaciones
   - Gastos por sucursal

8. **Productos (Products)** - Módulo base
   - Catálogo de productos
   - Rentabilidad por producto
   - Rotación de productos

---

## 🎯 REPORTES A IMPLEMENTAR

### PRIORIDAD 1 - REPORTES CRÍTICOS (Implementar primero)

#### 1. REPORTE DE VENTAS DETALLADO
**Descripción:** Reporte completo de todas las ventas con filtros avanzados
**Filtros:**
- Rango de fechas (desde/hasta)
- Sucursal
- Usuario vendedor
- Cliente
- Tipo de documento (factura, boleta, nota de venta)
- Método de pago (efectivo, transferencia, tarjeta, yape, plin)
- Tipo de pago (contado, crédito)
- Estado (pendiente, pagado, anulado)
- Producto específico

**Datos a mostrar:**
- Número de venta
- Fecha
- Cliente
- Tipo y número de documento
- Usuario vendedor
- Sucursal
- Productos vendidos (detalle)
- Subtotal (sin IGV)
- IGV
- Descuento
- Total
- Método de pago
- Estado
- Notas

**Agrupaciones y totales:**
- Total ventas por método de pago
- Total ventas por tipo de documento
- Total ventas por usuario
- Total ventas por sucursal
- Totales generales: Subtotal, IGV, Descuentos, Total
- Cantidad de ventas
- Ticket promedio

**Gráficos sugeridos:**
- Ventas por día (línea)
- Ventas por método de pago (pie)
- Top 10 productos más vendidos (barras)

---

#### 2. REPORTE DE CAJA DIARIA
**Descripción:** Detalle completo de movimientos de caja por sesión
**Filtros:**
- Rango de fechas
- Sucursal
- Caja registradora
- Usuario cajero
- Estado de sesión (abierta, cerrada)

**Datos a mostrar:**
**Cabecera de sesión:**
- Número de sesión
- Fecha y hora apertura
- Fecha y hora cierre
- Usuario cajero
- Caja registradora
- Sucursal
- Saldo inicial
- Saldo esperado
- Saldo real
- Diferencia (sobrante/faltante)

**Detalle de movimientos:**
- Hora
- Tipo (venta, compra, gasto, ingreso, egreso, transferencia)
- Descripción
- Método de pago
- Monto
- Referencia (número venta, número compra, etc.)

**Resumen:**
- Total ingresos por método de pago
- Total egresos por método de pago
- Total ventas en efectivo
- Total gastos
- Total otros ingresos
- Total otros egresos
- Saldo final calculado
- Diferencia con saldo real

---

#### 3. REPORTE DE INVENTARIO VALORIZADO
**Descripción:** Reporte del stock actual valorizado por sucursal
**Filtros:**
- Sucursal
- Categoría
- Marca
- Estado de stock (todos, normal, bajo, agotado)
- Búsqueda por producto

**Datos a mostrar:**
- Código producto
- Nombre producto
- Categoría
- Marca
- Sucursal
- Stock actual
- Stock mínimo
- Stock máximo
- Estado (normal/bajo/agotado)
- Precio costo
- Precio venta
- Valor costo total (stock × precio costo)
- Valor venta total (stock × precio venta)
- Margen de ganancia %
- Última actualización

**Totales:**
- Total productos
- Total valor en costo
- Total valor en venta
- Ganancia potencial
- Productos con stock bajo
- Productos agotados

**Alertas:**
- Listado de productos con stock bajo
- Listado de productos agotados
- Productos sin movimiento en X días

---

#### 4. REPORTE DE CUENTAS POR COBRAR
**Descripción:** Detalle de ventas a crédito pendientes de pago
**Filtros:**
- Rango de fechas de venta
- Cliente
- Sucursal
- Usuario vendedor
- Estado de pago (pendiente, vencido, próximo a vencer)
- Días de atraso (rangos: 0-7, 8-15, 16-30, 30+)

**Datos a mostrar:**
**Por venta:**
- Número de venta
- Fecha de venta
- Cliente
- Sucursal
- Usuario vendedor
- Total venta
- Pago inicial
- Saldo pendiente
- Días de crédito
- Cuotas totales
- Cuotas pagadas
- Cuotas pendientes

**Detalle de cuotas:**
- Número de cuota
- Monto
- Fecha vencimiento
- Estado (pendiente, vencido, pagado)
- Días de atraso
- Fecha de pago (si aplica)
- Método de pago (si aplica)

**Totales:**
- Total ventas a crédito
- Total cobrado
- Total pendiente
- Total vencido
- Total por vencer (próximos 7 días)

**Análisis por cliente:**
- Cliente
- Total compras a crédito
- Total pendiente
- Días promedio de atraso
- Estado (al día, atrasado)

---

#### 5. REPORTE DE COMPRAS A PROVEEDORES
**Descripción:** Historial de órdenes de compra y análisis de proveedores
**Filtros:**
- Rango de fechas
- Proveedor
- Sucursal
- Estado (pendiente, parcial, recibido, cancelado)
- Producto específico

**Datos a mostrar:**
**Por orden de compra:**
- Número de orden
- Fecha de orden
- Fecha esperada
- Fecha de recepción
- Proveedor
- Sucursal
- Usuario que ordenó
- Estado
- Subtotal
- IGV
- Descuento
- Total

**Detalle de productos:**
- Producto
- Cantidad ordenada
- Cantidad recibida
- Cantidad pendiente
- Precio unitario
- Precio de venta configurado
- Subtotal

**Totales:**
- Total órdenes
- Total comprado
- Total pendiente de recepción
- Órdenes canceladas

**Análisis por proveedor:**
- Proveedor
- Total órdenes
- Total comprado
- Promedio por orden
- Tiempo promedio de entrega
- Órdenes canceladas
- Productos más comprados

---

### PRIORIDAD 2 - REPORTES IMPORTANTES

#### 6. REPORTE DE GASTOS POR CATEGORÍA
**Descripción:** Análisis detallado de gastos operativos
**Filtros:**
- Rango de fechas
- Categoría de gasto
- Sucursal
- Método de pago
- Estado (pendiente, aprobado, rechazado)
- Usuario que registró

**Datos a mostrar:**
- Fecha
- Categoría
- Descripción
- Proveedor/Beneficiario
- Tipo de documento
- Número de documento
- Sucursal
- Monto
- Método de pago
- Usuario
- Estado
- Aprobado por
- Fecha aprobación

**Totales:**
- Total gastos por categoría
- Total gastos por método de pago
- Total gastos por sucursal
- Total gastos aprobados
- Total gastos pendientes
- Promedio de gasto por día

**Gráficos:**
- Gastos por categoría (pie)
- Evolución de gastos mensual (línea)
- Top categorías de gasto (barras)

---

#### 7. REPORTE DE RENTABILIDAD POR PRODUCTO
**Descripción:** Análisis de productos más y menos rentables
**Filtros:**
- Rango de fechas
- Categoría
- Marca
- Sucursal
- Top N productos (10, 20, 50, 100)

**Datos a mostrar:**
- Producto
- Categoría
- Marca
- Unidades vendidas
- Precio costo promedio
- Precio venta promedio
- Total costo
- Total venta
- Ganancia bruta
- Margen de ganancia %
- Rotación (veces vendido)
- Stock actual

**Análisis:**
- Top 10 productos más rentables
- Top 10 productos más vendidos
- Top 10 productos con menor rotación
- Productos con margen bajo (<20%)
- Productos con margen alto (>50%)

---

#### 8. REPORTE DE VENTAS POR CLIENTE
**Descripción:** Historial y análisis de comportamiento de clientes
**Filtros:**
- Rango de fechas
- Cliente específico
- Tipo de cliente (persona, empresa)
- Tipo de documento
- Sucursal

**Datos a mostrar:**
**Por cliente:**
- Cliente
- Tipo
- Documento
- Total compras
- Cantidad de compras
- Ticket promedio
- Última compra
- Frecuencia (días entre compras)
- Método de pago preferido
- Productos más comprados

**Detalle de compras:**
- Fecha
- Número de venta
- Tipo documento
- Productos
- Total
- Método de pago
- Estado

**Clasificación:**
- Clientes VIP (Top 20% en ventas)
- Clientes frecuentes (>5 compras)
- Clientes inactivos (sin compra en 3 meses)

---

#### 9. REPORTE DE CUADRE DE CAJA (ARQUEO)
**Descripción:** Reporte oficial de arqueo de caja para imprimir
**Uso:** Al cerrar caja

**Datos a mostrar:**
**Información de sesión:**
- Empresa
- Sucursal
- Caja registradora
- Usuario cajero
- Fecha y hora de apertura
- Fecha y hora de cierre
- Número de sesión

**Movimientos resumidos:**
- Saldo inicial
- (+) Total ventas en efectivo
- (+) Otros ingresos
- (-) Gastos
- (-) Otros egresos
- (=) Saldo esperado

**Desglose por método de pago:**
- Efectivo
- Transferencia
- Tarjeta
- Yape
- Plin
- Total

**Conteo de billetes y monedas:**
- Tabla para anotar:
  - S/ 200.00 × ___ = ______
  - S/ 100.00 × ___ = ______
  - S/ 50.00 × ___ = ______
  - S/ 20.00 × ___ = ______
  - S/ 10.00 × ___ = ______
  - S/ 5.00 × ___ = ______
  - S/ 2.00 × ___ = ______
  - S/ 1.00 × ___ = ______
  - S/ 0.50 × ___ = ______
  - S/ 0.20 × ___ = ______
  - S/ 0.10 × ___ = ______
  - Total contado: ______

**Diferencia:**
- Saldo esperado
- Saldo contado
- Diferencia (sobrante/faltante)

**Firmas:**
- Cajero
- Supervisor

---

#### 10. REPORTE DE MOVIMIENTOS DE INVENTARIO
**Descripción:** Trazabilidad de entradas y salidas de productos
**Filtros:**
- Rango de fechas
- Producto
- Sucursal
- Tipo de movimiento (venta, compra, ajuste, transferencia)

**Datos a mostrar:**
- Fecha y hora
- Producto
- Tipo de movimiento
- Cantidad
- Stock anterior
- Stock posterior
- Usuario
- Referencia (número venta/compra)
- Sucursal origen
- Sucursal destino (si aplica)
- Notas

**Totales:**
- Total entradas
- Total salidas
- Stock inicial
- Stock final
- Diferencia

---

### PRIORIDAD 3 - REPORTES ANALÍTICOS

#### 11. DASHBOARD EJECUTIVO (PDF)
**Descripción:** Resumen ejecutivo mensual para gerencia
**Contenido:**
- Período analizado
- Ventas totales vs mes anterior
- Utilidad bruta
- Gastos totales
- Utilidad neta
- Top 5 productos más vendidos
- Top 5 clientes
- Promedio de ticket
- Productos con stock crítico
- Cuentas por cobrar vencidas
- Gráficos de tendencias

---

#### 12. REPORTE DE LIBRO DE VENTAS (SUNAT)
**Descripción:** Registro de ventas formato SUNAT
**Filtros:**
- Mes y año
- Sucursal

**Datos según formato SUNAT:**
- Fecha de emisión
- Tipo de documento
- Serie
- Número
- Tipo de documento del cliente
- Número de documento del cliente
- Nombre/Razón social
- Valor exportación
- Base imponible
- IGV
- Importe total
- Tipo de cambio (si aplica)
- Estado (normal, anulado)

---

#### 13. REPORTE DE LIBRO DE COMPRAS (SUNAT)
**Descripción:** Registro de compras formato SUNAT
**Similar al libro de ventas pero para compras**

---

## 🎨 DISEÑO DE REPORTES EN PDF

### Elementos de Diseño Únicos

#### 1. **Header Corporativo**
```
┌────────────────────────────────────────────────────────────┐
│  [LOGO]              NOMBRE EMPRESA                        │
│                      RUC: XXXXXXXXXXXX                      │
│                      Dirección completa                     │
│                      Teléfono - Email                       │
├────────────────────────────────────────────────────────────┤
│           [TÍTULO DEL REPORTE EN GRANDE]                   │
│              Período: DD/MM/YYYY - DD/MM/YYYY              │
│                Generado: DD/MM/YYYY HH:MM                  │
│                    Usuario: Nombre Usuario                  │
└────────────────────────────────────────────────────────────┘
```

#### 2. **Sección de Filtros Aplicados**
Mostrar claramente qué filtros se aplicaron al reporte:
```
FILTROS APLICADOS:
• Sucursal: Sucursal Principal
• Usuario: Juan Pérez
• Método de pago: Efectivo, Transferencia
• Estado: Pagado
```

#### 3. **Tablas con Diseño Profesional**
- Cabeceras con color de fondo (usar color corporativo)
- Filas alternas con fondo claro para mejor lectura
- Bordes sutiles
- Totales en negrita y con fondo diferente
- Sub-totales cuando aplique

#### 4. **Sección de Resumen Ejecutivo**
Al inicio o final del reporte, un cuadro destacado con:
```
┌──────────────────────────────────────┐
│       RESUMEN EJECUTIVO              │
├──────────────────────────────────────┤
│ Total Registros:           150       │
│ Total General:        S/ 45,890.50   │
│ Promedio:             S/   305.94    │
│ Máximo:               S/ 1,250.00    │
│ Mínimo:               S/    15.50    │
└──────────────────────────────────────┘
```

#### 5. **Gráficos Embebidos**
Usar librerías PHP para generar gráficos:
- Chart.js + Headless browser
- O imagen generada con GD/Imagick
- Incluir gráficos clave en el PDF

#### 6. **Footer**
```
────────────────────────────────────────────────────────────
Sistema de Gestión - Ferretería          Página X de Y
Generado automáticamente el DD/MM/YYYY HH:MM
```

#### 7. **Orientación del Papel**
- **Vertical (Portrait):** Reportes con pocas columnas
- **Horizontal (Landscape):** Reportes con muchas columnas (ventas detalladas, inventario)

#### 8. **Tamaños de Papel**
- A4: Reportes estándar
- Ticket (80mm): Arqueo de caja, comprobantes
- Carta: Alternativa a A4

#### 9. **Códigos de Color**
- **Verde:** Totales positivos, stocks normales
- **Amarillo:** Alertas, stocks bajos
- **Rojo:** Faltantes, stocks agotados, vencidos
- **Azul:** Información neutral
- **Gris:** Datos secundarios

---

## 🛠️ ESPECIFICACIONES TÉCNICAS

### Stack Tecnológico
- **Backend:** Laravel 12
- **PDF Generation:** DomPDF 3.0
- **Frontend:** React 19 + TypeScript + Inertia.js
- **Gráficos:** Chart.js (para vista web) + Export to image for PDF

### Estructura de Archivos

```
app/
├── Http/
│   └── Controllers/
│       └── ReportController.php (nuevo)
├── Services/
│   └── ReportService.php (nuevo)
└── Exports/ (si se usa Excel también)

resources/
├── views/
│   └── pdf/
│       ├── layouts/
│       │   ├── base.blade.php
│       │   └── header.blade.php
│       └── reports/
│           ├── sales/
│           │   ├── detailed.blade.php
│           │   └── by-client.blade.php
│           ├── cash/
│           │   ├── daily.blade.php
│           │   └── closing.blade.php
│           ├── inventory/
│           │   ├── valued.blade.php
│           │   └── movements.blade.php
│           └── ... (otros reportes)
└── js/
    └── pages/
        └── Reports/
            ├── Index.tsx (listado de reportes)
            ├── Sales/
            │   ├── Detailed.tsx
            │   └── ByClient.tsx
            ├── Cash/
            │   ├── Daily.tsx
            │   └── Closing.tsx
            └── ... (otros reportes)

routes/
└── web.php (agregar rutas de reportes)

public/
└── css/
    └── pdf-styles.css (estilos para PDFs)
```

### Rutas

```php
Route::prefix('reports')->name('reports.')->middleware('auth')->group(function () {
    // Vista principal de reportes
    Route::get('/', [ReportController::class, 'index'])->name('index');

    // Reportes de Ventas
    Route::get('/sales/detailed', [ReportController::class, 'salesDetailed'])->name('sales.detailed');
    Route::get('/sales/detailed/pdf', [ReportController::class, 'salesDetailedPdf'])->name('sales.detailed.pdf');
    Route::get('/sales/by-client', [ReportController::class, 'salesByClient'])->name('sales.by-client');
    Route::get('/sales/by-client/pdf', [ReportController::class, 'salesByClientPdf'])->name('sales.by-client.pdf');

    // Reportes de Caja
    Route::get('/cash/daily', [ReportController::class, 'cashDaily'])->name('cash.daily');
    Route::get('/cash/daily/pdf', [ReportController::class, 'cashDailyPdf'])->name('cash.daily.pdf');
    Route::get('/cash/closing/{cashSession}', [ReportController::class, 'cashClosing'])->name('cash.closing');
    Route::get('/cash/closing/{cashSession}/pdf', [ReportController::class, 'cashClosingPdf'])->name('cash.closing.pdf');

    // Reportes de Inventario
    Route::get('/inventory/valued', [ReportController::class, 'inventoryValued'])->name('inventory.valued');
    Route::get('/inventory/valued/pdf', [ReportController::class, 'inventoryValuedPdf'])->name('inventory.valued.pdf');
    Route::get('/inventory/movements', [ReportController::class, 'inventoryMovements'])->name('inventory.movements');
    Route::get('/inventory/movements/pdf', [ReportController::class, 'inventoryMovementsPdf'])->name('inventory.movements.pdf');

    // Reportes de Cuentas por Cobrar
    Route::get('/receivables', [ReportController::class, 'receivables'])->name('receivables');
    Route::get('/receivables/pdf', [ReportController::class, 'receivablesPdf'])->name('receivables.pdf');

    // Reportes de Compras
    Route::get('/purchases', [ReportController::class, 'purchases'])->name('purchases');
    Route::get('/purchases/pdf', [ReportController::class, 'purchasesPdf'])->name('purchases.pdf');

    // Reportes de Gastos
    Route::get('/expenses', [ReportController::class, 'expenses'])->name('expenses');
    Route::get('/expenses/pdf', [ReportController::class, 'expensesPdf'])->name('expenses.pdf');

    // Reportes de Rentabilidad
    Route::get('/profitability/by-product', [ReportController::class, 'profitabilityByProduct'])->name('profitability.by-product');
    Route::get('/profitability/by-product/pdf', [ReportController::class, 'profitabilityByProductPdf'])->name('profitability.by-product.pdf');
});
```

---

## 📅 PLAN DE IMPLEMENTACIÓN PASO A PASO

### FASE 1: PREPARACIÓN Y ESTRUCTURA BASE (2-3 días)

#### Día 1: Setup Inicial
1. ✅ Instalar y configurar DomPDF
   ```bash
   composer require barryvdh/laravel-dompdf
   ```
2. ✅ Crear estructura de carpetas
3. ✅ Crear layout base para PDFs
4. ✅ Crear controlador `ReportController`
5. ✅ Crear servicio `ReportService`
6. ✅ Definir rutas base
7. ✅ Crear página index de reportes en React

#### Día 2-3: Layout y Estilos Base
1. ✅ Diseñar y crear `base.blade.php`
2. ✅ Diseñar y crear `header.blade.php` con logo y datos empresa
3. ✅ Crear CSS personalizado para PDFs
4. ✅ Crear componentes reutilizables:
   - Tabla base
   - Resumen ejecutivo
   - Sección de filtros
   - Footer
5. ✅ Probar generación básica de PDF

---

### FASE 2: REPORTES CRÍTICOS (6-8 días)

#### Sprint 1: Reporte de Ventas Detallado (2 días)
**Día 1:**
- Crear formulario de filtros en React
- Implementar lógica de consulta en backend
- Crear vista previa en web

**Día 2:**
- Crear template PDF
- Implementar generación de PDF
- Agregar totales y agrupaciones
- Pruebas y ajustes

#### Sprint 2: Reporte de Caja Diaria (1-2 días)
- Similar al Sprint 1
- Enfoque en movimientos detallados
- Tabla de desglose por método de pago

#### Sprint 3: Reporte de Inventario Valorizado (2 días)
- Formulario con filtros de stock
- Cálculos de valorización
- Alertas visuales (bajo stock, agotado)
- PDF con formato landscape

#### Sprint 4: Reporte de Cuentas por Cobrar (2 días)
- Consulta compleja con joins
- Cálculo de días de atraso
- Agrupación por cliente
- Vista de cuotas pendientes

---

### FASE 3: REPORTES IMPORTANTES (4-5 días)

#### Sprint 5: Reporte de Compras (1 día)
- Reutilizar lógica de ventas adaptada
- Filtros por proveedor
- Análisis de entregas

#### Sprint 6: Reporte de Gastos (1 día)
- Filtros por categoría
- Gráfico de gastos por categoría
- Totales por sucursal

#### Sprint 7: Reporte de Rentabilidad (1-2 días)
- Cálculos de margen
- Top productos
- Análisis de rotación

#### Sprint 8: Reporte de Ventas por Cliente (1 día)
- Historial de compras
- Análisis de comportamiento
- Clasificación de clientes

---

### FASE 4: REPORTES ESPECIALES (3-4 días)

#### Sprint 9: Arqueo de Caja (1 día)
- Template especial para impresión
- Tabla de billetes y monedas
- Secciones de firma
- Formato ticket o A4

#### Sprint 10: Movimientos de Inventario (1 día)
- Trazabilidad completa
- Filtros avanzados
- Exportación detallada

#### Sprint 11: Dashboard Ejecutivo PDF (2 días)
- Integración de múltiples fuentes
- Generación de gráficos
- Diseño ejecutivo premium

---

### FASE 5: REPORTES SUNAT (2-3 días)

#### Sprint 12: Libro de Ventas (1-2 días)
- Formato oficial SUNAT
- Validaciones de datos
- Exportación a Excel y PDF

#### Sprint 13: Libro de Compras (1 día)
- Similar a libro de ventas
- Registro de compras

---

### FASE 6: OPTIMIZACIÓN Y MEJORAS (2-3 días)

1. **Performance:**
   - Optimizar consultas pesadas
   - Implementar cache cuando sea posible
   - Agregar índices en BD si es necesario

2. **UX/UI:**
   - Agregar loading states
   - Preview antes de generar PDF
   - Guardar filtros favoritos
   - Programar reportes automáticos (opcional)

3. **Testing:**
   - Pruebas con datos reales
   - Verificar totales y cálculos
   - Validar diseño en diferentes tamaños

4. **Documentación:**
   - Documentar cada reporte
   - Crear manual de usuario
   - Documentar código

---

## 🎯 ENTREGABLES POR FASE

### Fase 1
- ✅ Estructura de carpetas creada
- ✅ DomPDF configurado
- ✅ Layout base funcional
- ✅ Ruta y controlador base
- ✅ Página index de reportes

### Fase 2
- ✅ 4 reportes críticos funcionando
- ✅ Formularios de filtros
- ✅ PDFs con diseño profesional
- ✅ Totales y agrupaciones correctas

### Fase 3
- ✅ 4 reportes importantes
- ✅ Análisis y gráficos básicos
- ✅ Exportación a PDF optimizada

### Fase 4
- ✅ 3 reportes especiales
- ✅ Arqueo de caja listo para impresión
- ✅ Dashboard ejecutivo

### Fase 5
- ✅ Reportes SUNAT
- ✅ Validaciones fiscales
- ✅ Exportación a múltiples formatos

### Fase 6
- ✅ Sistema optimizado
- ✅ Documentación completa
- ✅ Manual de usuario
- ✅ Todos los reportes testeados

---

## 📊 RECURSOS NECESARIOS

### Librerías PHP
```json
{
  "barryvdh/laravel-dompdf": "^3.0",
  "maatwebsite/excel": "^3.1" (opcional para Excel)
}
```

### Librerías JavaScript
```json
{
  "chart.js": "^4.0",
  "react-chartjs-2": "^5.0",
  "date-fns": "^3.0" (ya instalado)
}
```

### Configuración DomPDF
```php
// config/dompdf.php
return [
    'show_warnings' => false,
    'public_path' => public_path(),
    'convert_entities' => true,
    'options' => [
        'font_dir' => storage_path('fonts'),
        'font_cache' => storage_path('fonts'),
        'temp_dir' => sys_get_temp_dir(),
        'chroot' => realpath(base_path()),
        'enable_font_subsetting' => false,
        'pdf_backend' => 'CPDF',
        'default_media_type' => 'screen',
        'default_paper_size' => 'a4',
        'default_paper_orientation' => 'portrait',
        'default_font' => 'serif',
        'dpi' => 96,
        'enable_php' => false,
        'enable_javascript' => true,
        'enable_remote' => true,
        'font_height_ratio' => 1.1,
        'enable_html5_parser' => true,
    ],
];
```

---

## 🎨 GUÍA DE ESTILOS PARA PDFs

### Paleta de Colores (ejemplo)
```css
:root {
    --primary: #2563eb;      /* Azul principal */
    --secondary: #64748b;    /* Gris */
    --success: #10b981;      /* Verde */
    --warning: #f59e0b;      /* Amarillo */
    --danger: #ef4444;       /* Rojo */
    --light: #f8fafc;        /* Fondo claro */
    --dark: #1e293b;         /* Texto oscuro */
}
```

### Tipografía
```css
body {
    font-family: 'DejaVu Sans', sans-serif;
    font-size: 10pt;
    color: var(--dark);
}

h1 { font-size: 18pt; font-weight: bold; }
h2 { font-size: 14pt; font-weight: bold; }
h3 { font-size: 12pt; font-weight: bold; }

.small { font-size: 8pt; }
```

### Tablas
```css
table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
}

thead {
    background-color: var(--primary);
    color: white;
}

thead th {
    padding: 8px;
    text-align: left;
    font-weight: bold;
}

tbody tr:nth-child(even) {
    background-color: var(--light);
}

tbody td {
    padding: 6px 8px;
    border-bottom: 1px solid #e2e8f0;
}

tfoot {
    background-color: #f1f5f9;
    font-weight: bold;
}
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Performance
1. **Consultas Optimizadas:**
   - Usar eager loading para relaciones
   - Limitar resultados con paginación si es muy grande
   - Agregar índices en campos de filtro

2. **Generación de PDF:**
   - Para reportes muy grandes (>1000 registros), considerar:
     - Generar en background con jobs
     - Enviar por email cuando esté listo
     - Usar chunking para procesar por partes

3. **Cache:**
   - Cachear configuración de empresa
   - Cachear datos que no cambian (categorías, marcas)

### Seguridad
1. **Permisos:**
   - Crear permisos específicos por tipo de reporte
   - `report-sales`, `report-cash`, `report-inventory`, etc.

2. **Validación:**
   - Validar rangos de fechas
   - Limitar tamaño de reportes
   - Sanitizar inputs

### UX
1. **Feedback:**
   - Mostrar loading mientras se genera
   - Mostrar mensaje de éxito/error
   - Vista previa antes de PDF final

2. **Filtros:**
   - Guardar últimos filtros usados
   - Filtros predefinidos (hoy, esta semana, este mes)
   - Limpiar filtros fácilmente

---

## 📝 NOTAS FINALES

Este plan está diseñado para ser implementado de forma incremental, priorizando los reportes más críticos para el negocio. Cada sprint es independiente y genera valor inmediato.

**Tiempo estimado total:** 20-25 días de desarrollo

**Equipo recomendado:** 1 desarrollador full-stack

**Prioridades ajustables según necesidad del cliente.**

---

## ✅ CHECKLIST DE INICIO

Antes de comenzar la implementación:

- [ ] Revisar y aprobar diseños de PDF
- [ ] Confirmar lista de reportes prioritarios
- [ ] Validar filtros necesarios con usuario
- [ ] Preparar datos de prueba
- [ ] Configurar ambiente de desarrollo
- [ ] Instalar dependencias necesarias
- [ ] Crear rama de desarrollo `feature/reports`
- [ ] Definir estructura de permisos

---

**Fecha de creación del plan:** 03/10/2025
**Versión:** 1.0
**Estado:** Listo para implementación
