# 🗄️ DISEÑO DE BASE DE DATOS OPTIMIZADO - SIS FERRETERÍA

## 📊 ANÁLISIS DE ESTRUCTURA ACTUAL

### Migraciones Existentes (40 total)

**Migraciones por defecto (Laravel):**
1. `0001_01_01_000000_create_users_table.php` ✅ Mantener
2. `0001_01_01_000001_create_cache_table.php` ✅ Mantener
3. `0001_01_01_000002_create_jobs_table.php` ✅ Mantener
4. `2025_08_26_100418_add_two_factor_columns_to_users_table.php` ✅ Mantener (Fortify)
5. `2025_09_29_170647_create_permission_tables.php` ✅ Mantener (Spatie)

**Migraciones a CONSOLIDAR (35):**
- Múltiples migraciones de `add_*` y `create_*` se pueden consolidar
- Migraciones incrementales que se pueden optimizar
- Nueva estructura con sistema de unidades

---

## 🎯 NUEVA ESTRUCTURA OPTIMIZADA

### TABLAS PRINCIPALES (18 tablas)

#### 1. MÓDULO DE CONFIGURACIÓN (5 tablas)

**1.1 branches (Sucursales)**
```sql
CREATE TABLE branches (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_main BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);
```

**1.2 settings (Configuraciones del Sistema)**
```sql
CREATE TABLE settings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string', -- string, integer, boolean, json
    group VARCHAR(50) DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**1.3 document_series (Series de Documentos)**
```sql
CREATE TABLE document_series (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT UNSIGNED NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- boleta, factura, nota_credito, nota_debito
    series VARCHAR(10) NOT NULL,
    current_number INT UNSIGNED DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_series (branch_id, document_type, series)
);
```

**1.4 users (Usuarios) - EXTENDIDA**
```sql
-- Ya existe por defecto, agregar campos:
ALTER TABLE users ADD COLUMN (
    branch_id BIGINT UNSIGNED NULL,
    phone VARCHAR(20),
    role VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);
```

**1.5 unit_of_measures (Unidades de Medida)**
```sql
CREATE TABLE unit_of_measures (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- quantity, weight, volume, length, area, service
    is_base BOOLEAN DEFAULT FALSE,
    base_conversion_factor DECIMAL(15,6) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_type (type),
    INDEX idx_active (is_active)
);
```

---

#### 2. MÓDULO DE PRODUCTOS E INVENTARIO (6 tablas)

**2.1 categories (Categorías)**
```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_id BIGINT UNSIGNED NULL,
    description TEXT,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_active (is_active)
);
```

**2.2 brands (Marcas)**
```sql
CREATE TABLE brands (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    logo VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_active (is_active)
);
```

**2.3 products (Productos) - OPTIMIZADA**
```sql
CREATE TABLE products (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technical_specifications TEXT,

    -- Clasificación
    category_id BIGINT UNSIGNED NULL,
    brand_id BIGINT UNSIGNED NULL,

    -- Sistema de Unidades de Medida
    base_unit_id BIGINT UNSIGNED NULL, -- Unidad base (KG, MT, UND)
    sale_unit_id BIGINT UNSIGNED NULL, -- Unidad de venta (puede ser diferente)
    allow_decimal_quantity BOOLEAN DEFAULT FALSE, -- Permite decimales (0.5 kg, 1.25 mt)
    manage_by_batch BOOLEAN DEFAULT FALSE, -- Gestión por lotes
    batch_prefix VARCHAR(10),

    -- Precios
    purchase_price DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2) DEFAULT 0,

    -- IGV
    igv_percentage DECIMAL(5,2) DEFAULT 18.00,
    price_includes_igv BOOLEAN DEFAULT TRUE,

    -- Stock
    min_stock INT DEFAULT 0,
    max_stock INT DEFAULT 0,
    track_stock BOOLEAN DEFAULT TRUE,

    -- Dimensiones y peso (opcional)
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),

    -- Multimedia
    image VARCHAR(255),
    images JSON,

    -- Estado
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (base_unit_id) REFERENCES unit_of_measures(id) ON DELETE SET NULL,
    FOREIGN KEY (sale_unit_id) REFERENCES unit_of_measures(id) ON DELETE SET NULL,

    INDEX idx_code (code),
    INDEX idx_barcode (barcode),
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active)
);
```

**2.4 unit_conversions (Conversiones de Unidades)**
```sql
CREATE TABLE unit_conversions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    from_unit_id BIGINT UNSIGNED NOT NULL,
    to_unit_id BIGINT UNSIGNED NOT NULL,
    conversion_factor DECIMAL(15,6) NOT NULL, -- 1 caja = 24 unidades
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (from_unit_id) REFERENCES unit_of_measures(id) ON DELETE CASCADE,
    FOREIGN KEY (to_unit_id) REFERENCES unit_of_measures(id) ON DELETE CASCADE,

    UNIQUE KEY unique_conversion (product_id, from_unit_id, to_unit_id)
);
```

**2.5 inventory (Inventario por Sucursal)**
```sql
CREATE TABLE inventory (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    current_stock DECIMAL(15,3) DEFAULT 0, -- Decimal para soportar kg, metros, etc.
    min_stock DECIMAL(15,3) DEFAULT 0,
    max_stock DECIMAL(15,3) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2) DEFAULT 0,
    last_movement_date TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,

    UNIQUE KEY unique_inventory (product_id, branch_id),
    INDEX idx_stock (current_stock),
    INDEX idx_product (product_id),
    INDEX idx_branch (branch_id)
);
```

**2.6 inventory_movements (Movimientos de Inventario) - NUEVA**
```sql
CREATE TABLE inventory_movements (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    inventory_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL, -- entry, exit, adjustment, transfer
    quantity DECIMAL(15,3) NOT NULL,
    reference_type VARCHAR(100), -- App\Models\Sale, App\Models\PurchaseOrder
    reference_id BIGINT UNSIGNED,
    notes TEXT,
    user_id BIGINT UNSIGNED,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_inventory (inventory_id),
    INDEX idx_type (type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_created (created_at)
);
```

---

#### 3. MÓDULO DE CLIENTES Y PROVEEDORES (2 tablas)

**3.1 customers (Clientes)**
```sql
CREATE TABLE customers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    document_type VARCHAR(20) NOT NULL, -- DNI, RUC, CE
    document_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Perú',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    credit_days INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    INDEX idx_document (document_number),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);
```

**3.2 suppliers (Proveedores)**
```sql
CREATE TABLE suppliers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    document_type VARCHAR(20) NOT NULL, -- RUC
    document_number VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Perú',
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    INDEX idx_document (document_number),
    INDEX idx_name (business_name),
    INDEX idx_active (is_active)
);
```

---

#### 4. MÓDULO DE COMPRAS (2 tablas)

**4.1 purchase_orders (Órdenes de Compra)**
```sql
CREATE TABLE purchase_orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    reception_date DATE,

    supplier_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, parcial, recibido, cancelado

    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,

    payment_method VARCHAR(50), -- efectivo, tarjeta, transferencia, credito
    notes TEXT,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_order_number (order_number),
    INDEX idx_order_date (order_date),
    INDEX idx_status (status),
    INDEX idx_supplier (supplier_id)
);
```

**4.2 purchase_order_details (Detalle de Órdenes)**
```sql
CREATE TABLE purchase_order_details (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    unit_id BIGINT UNSIGNED, -- Unidad de compra

    quantity DECIMAL(15,3) NOT NULL,
    received_quantity DECIMAL(15,3) DEFAULT 0,

    cost_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),

    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (unit_id) REFERENCES unit_of_measures(id) ON DELETE SET NULL,

    INDEX idx_purchase (purchase_order_id),
    INDEX idx_product (product_id)
);
```

---

#### 5. MÓDULO DE VENTAS (4 tablas)

**5.1 sales (Ventas)**
```sql
CREATE TABLE sales (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    -- Documento
    document_type VARCHAR(50) NOT NULL, -- boleta, factura
    document_series VARCHAR(10) NOT NULL,
    document_number VARCHAR(20) NOT NULL,
    sale_date DATE NOT NULL,

    -- Relaciones
    customer_id BIGINT UNSIGNED NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    -- Pago
    payment_method VARCHAR(50) NOT NULL, -- efectivo, tarjeta, transferencia, yape, plin
    payment_type VARCHAR(50) NOT NULL, -- contado, credito

    -- Crédito
    credit_days INT DEFAULT 0,
    installments INT DEFAULT 1,
    initial_payment DECIMAL(10,2) DEFAULT 0,
    remaining_balance DECIMAL(10,2) DEFAULT 0,

    -- Estado
    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, pagado, anulado

    -- Montos
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    change_amount DECIMAL(10,2) DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    UNIQUE KEY unique_document (document_series, document_number),
    INDEX idx_sale_date (sale_date),
    INDEX idx_status (status),
    INDEX idx_customer (customer_id),
    INDEX idx_payment_type (payment_type)
);
```

**5.2 sale_details (Detalle de Ventas)**
```sql
CREATE TABLE sale_details (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sale_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    unit_id BIGINT UNSIGNED, -- Unidad de venta

    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (unit_id) REFERENCES unit_of_measures(id) ON DELETE SET NULL,

    INDEX idx_sale (sale_id),
    INDEX idx_product (product_id)
);
```

**5.3 payments (Pagos de Crédito)**
```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sale_id BIGINT UNSIGNED NOT NULL,

    installment_number INT NOT NULL,
    installment_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,

    paid_date DATE,
    paid_amount DECIMAL(10,2),
    payment_method VARCHAR(50),

    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, pagado, vencido

    notes TEXT,
    created_by BIGINT UNSIGNED,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_sale (sale_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
);
```

**5.4 quotes (Cotizaciones)**
```sql
CREATE TABLE quotes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    quote_date DATE NOT NULL,
    valid_until DATE,

    customer_id BIGINT UNSIGNED NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado, convertido

    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_quote_date (quote_date),
    INDEX idx_status (status)
);
```

---

#### 6. MÓDULO DE CAJA (4 tablas)

**6.1 cash_registers (Cajas Registradoras)**
```sql
CREATE TABLE cash_registers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,

    INDEX idx_branch (branch_id),
    INDEX idx_active (is_active)
);
```

**6.2 cash_sessions (Sesiones de Caja)**
```sql
CREATE TABLE cash_sessions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    cash_register_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,

    opened_at TIMESTAMP NOT NULL,
    opening_balance DECIMAL(10,2) DEFAULT 0,
    opening_notes TEXT,

    closed_at TIMESTAMP,
    expected_balance DECIMAL(10,2),
    actual_balance DECIMAL(10,2),
    difference DECIMAL(10,2),
    closing_notes TEXT,

    status VARCHAR(50) DEFAULT 'abierta', -- abierta, cerrada

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,

    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_opened (opened_at)
);
```

**6.3 cash_movements (Movimientos de Caja)**
```sql
CREATE TABLE cash_movements (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    cash_session_id BIGINT UNSIGNED NOT NULL,

    type VARCHAR(50) NOT NULL, -- ingreso, egreso, venta, compra, gasto, pago_credito, transferencia
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- efectivo, tarjeta, transferencia

    reference_type VARCHAR(100), -- App\Models\Sale, App\Models\Expense
    reference_id BIGINT UNSIGNED,

    description TEXT,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (cash_session_id) REFERENCES cash_sessions(id) ON DELETE CASCADE,

    INDEX idx_session (cash_session_id),
    INDEX idx_type (type),
    INDEX idx_reference (reference_type, reference_id)
);
```

**6.4 cash_transfers (Transferencias entre Cajas)**
```sql
CREATE TABLE cash_transfers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    from_cash_register_id BIGINT UNSIGNED NOT NULL,
    to_cash_register_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transfer_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, completado, cancelado
    notes TEXT,
    user_id BIGINT UNSIGNED,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (from_cash_register_id) REFERENCES cash_registers(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_cash_register_id) REFERENCES cash_registers(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_from (from_cash_register_id),
    INDEX idx_to (to_cash_register_id),
    INDEX idx_status (status)
);
```

---

#### 7. MÓDULO DE GASTOS (2 tablas)

**7.1 expense_categories (Categorías de Gastos)**
```sql
CREATE TABLE expense_categories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    INDEX idx_active (is_active)
);
```

**7.2 expenses (Gastos)**
```sql
CREATE TABLE expenses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    expense_category_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,

    receipt_number VARCHAR(50),
    receipt_file VARCHAR(255),

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_date (date),
    INDEX idx_category (expense_category_id)
);
```

---

## 📈 ÍNDICES Y OPTIMIZACIONES

### Índices Críticos para Performance

```sql
-- Ventas
CREATE INDEX idx_sales_composite ON sales(sale_date, status, branch_id);
CREATE INDEX idx_sales_customer_date ON sales(customer_id, sale_date);

-- Inventario
CREATE INDEX idx_inventory_composite ON inventory(product_id, branch_id, current_stock);

-- Pagos
CREATE INDEX idx_payments_overdue ON payments(due_date, status) WHERE status = 'pendiente';

-- Productos
CREATE INDEX idx_products_search ON products(name, code, barcode) USING FULLTEXT; -- Solo MySQL 5.6+
```

---

## 🔄 RELACIONES PRINCIPALES

```
users
  ├─ has many → sales
  ├─ has many → purchase_orders
  ├─ has many → cash_sessions
  └─ belongs to → branches

branches
  ├─ has many → inventory
  ├─ has many → sales
  ├─ has many → cash_registers
  └─ has many → users

products
  ├─ belongs to → categories
  ├─ belongs to → brands
  ├─ belongs to → unit_of_measures (base_unit)
  ├─ belongs to → unit_of_measures (sale_unit)
  ├─ has many → inventory
  ├─ has many → sale_details
  └─ has many → unit_conversions

sales
  ├─ belongs to → customers
  ├─ belongs to → branches
  ├─ belongs to → users
  ├─ has many → sale_details
  └─ has many → payments

inventory
  ├─ belongs to → products
  ├─ belongs to → branches
  └─ has many → inventory_movements
```

---

## 🎯 VENTAJAS DE LA NUEVA ESTRUCTURA

1. **✅ Multi-Rubro:** Sistema de unidades flexible para ferretería, abarrotes, mecánica
2. **✅ Escalable:** Estructura normalizada y optimizada
3. **✅ Sin Duplicidad:** Migraciones consolidadas en lugar de 40+ archivos
4. **✅ Trazabilidad:** Tabla de movimientos de inventario
5. **✅ Performance:** Índices estratégicos en campos críticos
6. **✅ Mantenible:** Relaciones claras y bien documentadas

---

## 📝 ORDEN DE CREACIÓN DE MIGRACIONES

1. ✅ Mantener migraciones default de Laravel
2. `01_create_branches_table`
3. `02_create_settings_table`
4. `03_create_unit_of_measures_table`
5. `04_create_categories_table`
6. `05_create_brands_table`
7. `06_create_products_table`
8. `07_create_unit_conversions_table`
9. `08_create_inventory_table`
10. `09_create_inventory_movements_table`
11. `10_create_customers_table`
12. `11_create_suppliers_table`
13. `12_create_purchase_orders_table`
14. `13_create_purchase_order_details_table`
15. `14_create_document_series_table`
16. `15_create_sales_table`
17. `16_create_sale_details_table`
18. `17_create_payments_table`
19. `18_create_quotes_table`
20. `19_create_quote_details_table`
21. `20_create_cash_registers_table`
22. `21_create_cash_sessions_table`
23. `22_create_cash_movements_table`
24. `23_create_cash_transfers_table`
25. `24_create_expense_categories_table`
26. `25_create_expenses_table`
27. `26_add_fields_to_users_table` (branch_id, phone, role, is_active, last_login_at)

**Total: 27 migraciones optimizadas (vs 40 actuales)**

---

## ⚠️ NOTAS IMPORTANTES

- Las migraciones de Spatie Permissions se mantienen tal cual
- La tabla `users` se extiende en lugar de recrearse
- Todas las tablas tienen `created_at` y `updated_at`
- Las tablas críticas tienen `deleted_at` (soft deletes)
- Los índices están optimizados para las consultas más frecuentes

---

## 🚀 SIGUIENTE PASO

**¿Proceder con la creación de las migraciones optimizadas?**

1. Hacer `migrate:reset`
2. Eliminar migraciones antiguas (excepto defaults)
3. Crear las 27 nuevas migraciones
4. Ejecutar y verificar
