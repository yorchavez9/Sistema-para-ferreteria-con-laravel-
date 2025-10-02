import { useState, Fragment, ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Plus,
    Minus,
    Search,
    X,
} from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';
import { typography, spacing, tables, buttons, iconSizes } from '@/lib/design-system';

export interface Column<T = any> {
    /** Clave única de la columna */
    key: string;
    /** Título que se muestra en el header */
    label: string;
    /** Indica si la columna es ordenable */
    sortable?: boolean;
    /** Clave del campo para ordenar (si es diferente al key) */
    sortKey?: string;
    /** Render personalizado de la celda */
    render?: (row: T) => ReactNode;
    /** Clase CSS para el header */
    headerClassName?: string;
    /** Clase CSS para las celdas */
    cellClassName?: string;
    /** Ocultar en móvil */
    hideOnMobile?: boolean;
    /** Mostrar solo en móvil (para la vista expandida) */
    showInExpanded?: boolean;
}

export interface Filter {
    /** Clave del filtro */
    key: string;
    /** Label del filtro */
    label: string;
    /** Tipo de filtro */
    type: 'select' | 'date' | 'text';
    /** Opciones (para select) */
    options?: Array<{ value: string; label: string }>;
    /** Placeholder */
    placeholder?: string;
    /** Valor por defecto */
    defaultValue?: string;
}

export interface DataTableProps<T = any> {
    /** Datos de la tabla */
    data: T[];
    /** Definición de columnas */
    columns: Column<T>[];
    /** Configuración de paginación */
    pagination?: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
        from?: number;
        to?: number;
    };
    /** Filtros disponibles */
    filters?: Filter[];
    /** Valores actuales de filtros */
    filterValues?: Record<string, any>;
    /** Configuración de ordenamiento */
    sorting?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    /** Término de búsqueda */
    searchTerm?: string;
    /** Placeholder del buscador */
    searchPlaceholder?: string;
    /** URL base para las peticiones */
    baseUrl: string;
    /** Clase para el contenedor */
    className?: string;
    /** Mensaje cuando no hay datos */
    emptyMessage?: string;
    /** Icono para estado vacío */
    emptyIcon?: ReactNode;
    /** Mostrar buscador */
    showSearch?: boolean;
    /** Mostrar selector de items por página */
    showPerPage?: boolean;
    /** Opciones de items por página */
    perPageOptions?: number[];
    /** Habilitar filas expandibles en móvil */
    expandableRows?: boolean;
    /** Render personalizado para el contenido expandido */
    renderExpanded?: (row: T) => ReactNode;
    /** Función para obtener un ID único de cada fila */
    getRowId?: (row: T) => string | number;
}

export default function DataTable<T = any>({
    data,
    columns,
    pagination,
    filters = [],
    filterValues = {},
    sorting,
    searchTerm = '',
    searchPlaceholder = 'Buscar...',
    baseUrl,
    className,
    emptyMessage = 'No se encontraron resultados.',
    emptyIcon,
    showSearch = true,
    showPerPage = true,
    perPageOptions = [10, 15, 25, 50, 100],
    expandableRows = true,
    renderExpanded,
    getRowId = (row: any) => row.id,
}: DataTableProps<T>) {
    const [localSearch, setLocalSearch] = useState(searchTerm);
    const [localFilters, setLocalFilters] = useState(filterValues);
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = Object.values(localFilters).some(val => val && val !== '');

    // Búsqueda con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        performSearch({
            ...localFilters,
            search: value,
        });
    }, 500);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        debouncedSearch(value);
    };

    const performSearch = (params: Record<string, any>) => {
        router.get(baseUrl, {
            ...params,
            sort_field: sorting?.field,
            sort_direction: sorting?.direction,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (column: Column<T>) => {
        if (!column.sortable) return;

        const sortKey = column.sortKey || column.key;
        const newDirection = sorting?.field === sortKey && sorting?.direction === 'asc' ? 'desc' : 'asc';

        router.get(baseUrl, {
            ...localFilters,
            search: localSearch,
            sort_field: sortKey,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (key: string, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        performSearch({
            ...localFilters,
            search: localSearch,
        });
        setShowFilters(false);
    };

    const clearFilters = () => {
        setLocalFilters({});
        setLocalSearch('');
        router.get(baseUrl);
    };

    const handlePerPageChange = (value: string) => {
        router.get(baseUrl, {
            ...localFilters,
            search: localSearch,
            per_page: value,
            sort_field: sorting?.field,
            sort_direction: sorting?.direction,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(`${baseUrl}?page=${page}`, {
            ...localFilters,
            search: localSearch,
            per_page: pagination?.perPage,
            sort_field: sorting?.field,
            sort_direction: sorting?.direction,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (rowId: string | number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    const SortIcon = ({ column }: { column: Column<T> }) => {
        if (!column.sortable) return null;

        const sortKey = column.sortKey || column.key;
        if (sorting?.field !== sortKey) {
            return <ChevronsUpDown className={iconSizes.sm} />;
        }

        return sorting.direction === 'asc'
            ? <ChevronUp className={iconSizes.sm} />
            : <ChevronDown className={iconSizes.sm} />;
    };

    const visibleColumns = columns.filter(col => !col.hideOnMobile);
    const expandedColumns = columns.filter(col => col.showInExpanded);

    return (
        <div className={cn(spacing.sectionGapCompact, className)}>
            {/* Barra de Búsqueda y Filtros */}
            {(showSearch || filters.length > 0) && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            {showSearch && (
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={localSearch}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            )}

                            {filters.length > 0 && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setShowFilters(!showFilters)}
                                        variant="outline"
                                        className={cn(hasActiveFilters && 'border-primary')}
                                    >
                                        <Search className={cn(iconSizes.sm, 'mr-2')} />
                                        Filtros {hasActiveFilters && `(${Object.values(localFilters).filter(v => v).length})`}
                                    </Button>

                                    {hasActiveFilters && (
                                        <Button
                                            onClick={clearFilters}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <X className={iconSizes.sm} />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Panel de Filtros */}
                        {showFilters && filters.length > 0 && (
                            <div className={cn('mt-4 pt-4 border-t', spacing.gridGapCompact)}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filters.map((filter) => (
                                        <div key={filter.key}>
                                            <Label htmlFor={filter.key} className={typography.formLabel}>
                                                {filter.label}
                                            </Label>
                                            {filter.type === 'select' && (
                                                <Select
                                                    value={localFilters[filter.key] || ''}
                                                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                                                >
                                                    <SelectTrigger id={filter.key}>
                                                        <SelectValue placeholder={filter.placeholder || 'Seleccionar'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">Todos</SelectItem>
                                                        {filter.options?.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {filter.type === 'date' && (
                                                <Input
                                                    id={filter.key}
                                                    type="date"
                                                    value={localFilters[filter.key] || ''}
                                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                />
                                            )}
                                            {filter.type === 'text' && (
                                                <Input
                                                    id={filter.key}
                                                    type="text"
                                                    placeholder={filter.placeholder}
                                                    value={localFilters[filter.key] || ''}
                                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button onClick={applyFilters}>
                                        Aplicar Filtros
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline">
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tabla */}
            <div className={tables.container}>
                <Table>
                    <TableHeader className={tables.header}>
                        <TableRow>
                            {/* Columna expandir (solo móvil) */}
                            {expandableRows && expandedColumns.length > 0 && (
                                <TableHead className="md:hidden w-10"></TableHead>
                            )}

                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(
                                        typography.tableHeader,
                                        column.sortable && 'cursor-pointer hover:bg-muted/70 select-none',
                                        column.hideOnMobile && tables.hideOnMobile,
                                        column.headerClassName
                                    )}
                                    onClick={() => column.sortable && handleSort(column)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        <SortIcon column={column} />
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((row) => {
                                const rowId = getRowId(row);
                                const isExpanded = expandedRows.has(rowId);

                                return (
                                    <Fragment key={rowId}>
                                        <TableRow className={tables.row}>
                                            {/* Botón expandir (solo móvil) */}
                                            {expandableRows && expandedColumns.length > 0 && (
                                                <TableCell className="md:hidden w-10 p-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRowExpansion(rowId)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {isExpanded ? (
                                                            <Minus className={iconSizes.sm} />
                                                        ) : (
                                                            <Plus className={iconSizes.sm} />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            )}

                                            {visibleColumns.map((column) => (
                                                <TableCell
                                                    key={column.key}
                                                    className={cn(
                                                        typography.tableCell,
                                                        column.hideOnMobile && tables.hideOnMobile,
                                                        column.cellClassName
                                                    )}
                                                >
                                                    {column.render
                                                        ? column.render(row)
                                                        : (row as any)[column.key]
                                                    }
                                                </TableCell>
                                            ))}
                                        </TableRow>

                                        {/* Fila expandida (solo móvil) */}
                                        {expandableRows && isExpanded && (
                                            <TableRow className={cn('md:hidden', tables.rowExpanded)}>
                                                <TableCell colSpan={visibleColumns.length + 1} className="p-4">
                                                    {renderExpanded ? (
                                                        renderExpanded(row)
                                                    ) : (
                                                        <div className={spacing.sectionGapCompact}>
                                                            {expandedColumns.map((column) => (
                                                                <div key={column.key}>
                                                                    <p className={typography.statLabel}>
                                                                        {column.label}
                                                                    </p>
                                                                    <p className={cn(typography.tableCell, 'mt-1')}>
                                                                        {column.render
                                                                            ? column.render(row)
                                                                            : (row as any)[column.key]
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumns.length + (expandableRows ? 1 : 0)}
                                    className="text-center py-12"
                                >
                                    {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
                                    <p className={cn(typography.body, 'text-muted-foreground')}>
                                        {emptyMessage}
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Paginación */}
                {pagination && data.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20">
                        <div className={cn(typography.small, 'text-muted-foreground')}>
                            Mostrando <span className="font-medium">{pagination.from || 1}</span> a{' '}
                            <span className="font-medium">{pagination.to || data.length}</span> de{' '}
                            <span className="font-medium">{pagination.total}</span> resultados
                        </div>

                        <div className="flex items-center gap-4">
                            {showPerPage && (
                                <div className="flex items-center gap-2">
                                    <Label className={cn(typography.small, 'text-muted-foreground')}>
                                        Por página:
                                    </Label>
                                    <Select
                                        value={pagination.perPage.toString()}
                                        onValueChange={handlePerPageChange}
                                    >
                                        <SelectTrigger className="w-[70px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {perPageOptions.map((option) => (
                                                <SelectItem key={option} value={option.toString()}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    Anterior
                                </Button>

                                {/* Números de página */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.lastPage <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage >= pagination.lastPage - 2) {
                                            pageNum = pagination.lastPage - 4 + i;
                                        } else {
                                            pageNum = pagination.currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
