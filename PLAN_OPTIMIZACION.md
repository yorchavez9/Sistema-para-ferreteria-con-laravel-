# 🚀 PLAN DE OPTIMIZACIÓN Y MEJORAS - SIS FERRETERÍA

## 📋 RESUMEN EJECUTIVO

Este documento detalla el plan completo para optimizar el sistema, haciéndolo multi-rubro (ferretería, abarrotes, mecánica), escalable, y 100% responsivo.

---

## 1. SISTEMA MULTI-RUBRO CON UNIDADES DE MEDIDA FLEXIBLES

### 1.1 Base de Datos Implementada

**Migraciones Creadas:**
- ✅ `create_unit_of_measures_table` - Unidades de medida (UND, CJA, KG, MT, etc.)
- ✅ `create_unit_conversions_table` - Conversiones entre unidades
- ✅ `add_unit_system_to_products_table` - Sistema de unidades en productos

**Seeder Creado:**
- ✅ `UnitOfMeasureSeeder` - 35 unidades de medida precargadas

### 1.2 Unidades Soportadas

**Por Cantidad:**
- Unidad (UND), Caja (CJA), Paquete (PQT), Docena (DOC), Ciento (CTO), Millar (MLL), Par (PAR)

**Por Peso:**
- Kilogramo (KG), Gramo (GR), Tonelada (TON), Libra (LB), Onza (OZ), Quintal (QTL), Saco (SCO)

**Por Volumen:**
- Litro (LT), Mililitro (ML), Galón (GAL), Metro Cúbico (M3), Barril (BRL)

**Por Longitud:**
- Metro (MT), Centímetro (CM), Milímetro (MM), Kilómetro (KM), Pulgada (PLG), Pie (PIE), Yarda (YD), Rollo (RLL)

**Por Área:**
- Metro Cuadrado (M2), Centímetro Cuadrado (CM2), Hectárea (HA)

**Servicios:**
- Hora (HR), Día (DIA), Mes (MES)

### 1.3 Modelos a Crear

**UnitOfMeasure.php:**
```php
class UnitOfMeasure extends Model
{
    protected $fillable = [
        'name', 'abbreviation', 'type', 'is_base',
        'base_conversion_factor', 'is_active', 'description'
    ];

    public function products() {
        return $this->hasMany(Product::class, 'base_unit_id');
    }

    public function conversionsFrom() {
        return $this->hasMany(UnitConversion::class, 'from_unit_id');
    }

    public function conversionsTo() {
        return $this->hasMany(UnitConversion::class, 'to_unit_id');
    }

    public function scopeActive($query) {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type) {
        return $query->where('type', $type);
    }
}
```

**UnitConversion.php:**
```php
class UnitConversion extends Model
{
    protected $fillable = [
        'product_id', 'from_unit_id', 'to_unit_id',
        'conversion_factor', 'is_default'
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function fromUnit() {
        return $this->belongsTo(UnitOfMeasure::class, 'from_unit_id');
    }

    public function toUnit() {
        return $this->belongsTo(UnitOfMeasure::class, 'to_unit_id');
    }

    // Convertir cantidad
    public static function convert($productId, $quantity, $fromUnitId, $toUnitId) {
        $conversion = self::where('product_id', $productId)
            ->where('from_unit_id', $fromUnitId)
            ->where('to_unit_id', $toUnitId)
            ->first();

        if ($conversion) {
            return $quantity * $conversion->conversion_factor;
        }

        // Si no hay conversión específica, usar factores base
        $fromUnit = UnitOfMeasure::find($fromUnitId);
        $toUnit = UnitOfMeasure::find($toUnitId);

        if ($fromUnit->type === $toUnit->type &&
            $fromUnit->base_conversion_factor &&
            $toUnit->base_conversion_factor) {
            return ($quantity * $fromUnit->base_conversion_factor) / $toUnit->base_conversion_factor;
        }

        throw new \Exception("No se puede convertir entre estas unidades");
    }
}
```

**Actualizar Product.php:**
```php
public function baseUnit() {
    return $this->belongsTo(UnitOfMeasure::class, 'base_unit_id');
}

public function saleUnit() {
    return $this->belongsTo(UnitOfMeasure::class, 'sale_unit_id');
}

public function unitConversions() {
    return $this->hasMany(UnitConversion::class);
}

// Convertir cantidad
public function convertQuantity($quantity, $fromUnitId, $toUnitId) {
    return UnitConversion::convert($this->id, $quantity, $fromUnitId, $toUnitId);
}
```

---

## 2. OPTIMIZACIÓN Y ELIMINACIÓN DE CÓDIGO DUPLICADO

### 2.1 Traits Reutilizables a Crear

**app/Traits/HasFilters.php:**
```php
trait HasFilters
{
    public function applyFilters($query, $filters, $searchableFields = [])
    {
        // Búsqueda general
        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters, $searchableFields) {
                foreach ($searchableFields as $field) {
                    if (str_contains($field, '.')) {
                        // Relación
                        [$relation, $column] = explode('.', $field);
                        $q->orWhereHas($relation, function($query) use ($column, $filters) {
                            $query->where($column, 'like', "%{$filters['search']}%");
                        });
                    } else {
                        $q->orWhere($field, 'like', "%{$filters['search']}%");
                    }
                }
            });
        }

        // Filtros específicos
        foreach ($filters as $key => $value) {
            if ($key !== 'search' && !empty($value)) {
                $query->where($key, $value);
            }
        }

        return $query;
    }
}
```

**app/Traits/HasStats.php:**
```php
trait HasStats
{
    public function getStats($filters = [])
    {
        $query = $this->newQuery();

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return [
            'total' => $query->count(),
            'sum' => $query->sum('total'),
            // ... más estadísticas
        ];
    }
}
```

### 2.2 Servicios Reutilizables

**app/Services/BaseService.php:**
```php
abstract class BaseService
{
    protected $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function all($filters = [])
    {
        $query = $this->model::query();

        if (method_exists($this->model, 'applyFilters')) {
            $query = $this->model->applyFilters($query, $filters);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function find($id)
    {
        return $this->model::findOrFail($id);
    }

    public function create(array $data)
    {
        DB::beginTransaction();
        try {
            $record = $this->model::create($data);
            DB::commit();
            return $record;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // ... más métodos genéricos
}
```

---

## 3. DISEÑO Y ESTILOS UNIFICADOS

### 3.1 Sistema de Colores Consistente

**Definir en Tailwind Config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        }
      }
    }
  }
}
```

### 3.2 Componente de Alertas Unificado

**resources/js/components/ui/alert.tsx:**
```tsx
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    title?: string;
    message: string;
    onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        error: <XCircle className="h-5 w-5 text-red-600" />,
        warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
        info: <Info className="h-5 w-5 text-blue-600" />,
    };

    return (
        <div className={`p-4 rounded-lg border ${styles[type]} flex items-start gap-3`}>
            {icons[type]}
            <div className="flex-1">
                {title && <h3 className="font-semibold mb-1">{title}</h3>}
                <p className="text-sm">{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    ×
                </button>
            )}
        </div>
    );
}
```

---

## 4. DATATABLE AVANZADO REUTILIZABLE

### 4.1 Componente DataTable Completo

**resources/js/components/ui/data-table.tsx:**
```tsx
import { useState } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Search, Filter, Download
} from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onSearch?: (search: string) => void;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    onPageChange?: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    isLoading?: boolean;
    actions?: (row: any) => React.ReactNode;
}

export function DataTable({
    columns,
    data,
    pagination,
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    isLoading,
    actions
}: DataTableProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (onSearch) onSearch(debouncedSearch);
    }, [debouncedSearch]);

    const handleSort = (column: string) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
        if (onSort) onSort(column, newDirection);
    };

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>
                    <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer select-none' : ''} ${column.className || ''}`}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && sortColumn === column.key && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="px-6 py-3 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {columns.map((column) => (
                                        <td key={column.key} className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                        Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
                        {pagination.total} resultados
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={pagination.per_page}
                            onChange={(e) => onPerPageChange?.(Number(e.target.value))}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onPageChange?.(1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 rounded border disabled:opacity-50"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onPageChange?.(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 rounded border disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 border rounded">
                                {pagination.current_page} / {pagination.last_page}
                            </span>
                            <button
                                onClick={() => onPageChange?.(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2 rounded border disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onPageChange?.(pagination.last_page)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2 rounded border disabled:opacity-50"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
```

---

## 5. RESPONSIVE DESIGN 100%

### 5.1 Breakpoints Tailwind

```javascript
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### 5.2 Clases Responsive Comunes

**Container Responsive:**
```tsx
<div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  {/* Contenido */}
</div>
```

**Grid Responsive:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

**Tablas Responsive:**
```tsx
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <table className="min-w-full divide-y divide-gray-200">
      {/* Tabla */}
    </table>
  </div>
</div>
```

---

## 6. PASOS DE IMPLEMENTACIÓN

### Fase 1: Sistema de Unidades (2-3 días)
1. ✅ Ejecutar migraciones
2. ✅ Ejecutar seeder
3. ⬜ Crear modelos UnitOfMeasure y UnitConversion
4. ⬜ Actualizar modelo Product
5. ⬜ Crear CRUD de unidades de medida
6. ⬜ Integrar en formulario de productos

### Fase 2: Optimización de Código (3-4 días)
1. ⬜ Crear traits reutilizables
2. ⬜ Crear BaseService y extender servicios
3. ⬜ Refactorizar controladores para usar traits
4. ⬜ Eliminar código duplicado

### Fase 3: Diseño y UX (4-5 días)
1. ⬜ Unificar sistema de colores
2. ⬜ Crear componente Alert unificado
3. ⬜ Implementar DataTable avanzado
4. ⬜ Hacer responsive todas las vistas
5. ⬜ Optimizar tablas para móvil

### Fase 4: Testing y Ajustes (2-3 días)
1. ⬜ Probar conversiones de unidades
2. ⬜ Verificar responsive en todos los dispositivos
3. ⬜ Ajustar estilos finales
4. ⬜ Documentar cambios

---

## 7. COMANDOS PARA EJECUTAR

```bash
# 1. Ejecutar migraciones
php artisan migrate

# 2. Ejecutar seeder de unidades
php artisan db:seed --class=UnitOfMeasureSeeder

# 3. Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# 4. Regenerar autoload
composer dump-autoload
```

---

## 8. EJEMPLOS DE USO

### Ejemplo 1: Producto con Múltiples Unidades (Ferretería)

```php
// Cemento en sacos
$producto = Product::create([
    'name' => 'Cemento Portland Tipo I',
    'base_unit_id' => 1, // Kilogramo
    'sale_unit_id' => 13, // Saco
    'allow_decimal_quantity' => false,
    // ...
]);

// Conversión: 1 saco = 42.5 kg
UnitConversion::create([
    'product_id' => $producto->id,
    'from_unit_id' => 13, // Saco
    'to_unit_id' => 1, // KG
    'conversion_factor' => 42.5,
    'is_default' => true
]);
```

### Ejemplo 2: Producto por Peso (Abarrotes)

```php
// Arroz a granel
$producto = Product::create([
    'name' => 'Arroz Superior',
    'base_unit_id' => 1, // Kilogramo
    'sale_unit_id' => 1, // Kilogramo
    'allow_decimal_quantity' => true, // Permite 0.5 kg, 1.25 kg, etc.
    // ...
]);
```

### Ejemplo 3: Producto por Unidad (Mecánica)

```php
// Filtro de aceite
$producto = Product::create([
    'name' => 'Filtro de Aceite W920/21',
    'base_unit_id' => 7, // Unidad
    'sale_unit_id' => 7, // Unidad
    'allow_decimal_quantity' => false,
    // ...
]);

// Conversión: 1 caja = 12 unidades
UnitConversion::create([
    'product_id' => $producto->id,
    'from_unit_id' => 8, // Caja
    'to_unit_id' => 7, // Unidad
    'conversion_factor' => 12,
]);
```

---

## 9. PRÓXIMOS PASOS INMEDIATOS

1. **Revisar este documento** y aprobar el plan
2. **Ejecutar migraciones** con los comandos indicados
3. **Implementar modelos** UnitOfMeasure y UnitConversion
4. **Crear CRUD** de unidades de medida
5. **Actualizar formulario** de productos con sistema de unidades

---

**¿Deseas que proceda con la implementación completa?**
