import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    FileDown,
    Search,
    RefreshCw,
    Eye,
    FileText,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Wallet,
} from 'lucide-react';
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
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Caja Diaria', href: '/reports/cash/daily' },
];

interface CashSession {
    id: number;
    opened_at: string;
    closed_at?: string;
    opening_balance: number;
    expected_balance?: number;
    actual_balance?: number;
    difference?: number;
    status: string;
    cash_register: {
        id: number;
        name: string;
        branch?: {
            id: number;
            name: string;
        };
    };
    user: {
        id: number;
        name: string;
    };
}

interface Props {
    sessions: {
        data: CashSession[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    totals: {
        count: number;
        total_opening_balance: number;
        total_expected_balance: number;
        total_actual_balance: number;
        total_difference: number;
    };
    branches: Array<{ id: number; name: string }>;
    cashRegisters: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        branch_id?: string;
        cash_register_id?: string;
        user_id?: string;
        status?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

export default function CashDailyReport({
    sessions = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    totals = {
        count: 0,
        total_opening_balance: 0,
        total_expected_balance: 0,
        total_actual_balance: 0,
        total_difference: 0,
    },
    branches = [],
    cashRegisters = [],
    users = [],
    filters: initialFilters = {},
}: Props) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [filterData, setFilterData] = useState({
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        branch_id: initialFilters.branch_id || '',
        cash_register_id: initialFilters.cash_register_id || '',
        user_id: initialFilters.user_id || '',
        status: initialFilters.status || '',
        per_page: initialFilters.per_page || '15',
    });
    const [sortField, setSortField] = useState(initialFilters.sort_field || 'opened_at');
    const [sortDirection, setSortDirection] = useState(initialFilters.sort_direction || 'desc');
    const [isGenerating, setIsGenerating] = useState(false);

    // Busqueda en tiempo real con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const params: any = {
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/cash/daily', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleFilter = () => {
        const params: any = {
            search: searchTerm,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/cash/daily', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            date_from: '',
            date_to: '',
            branch_id: '',
            cash_register_id: '',
            user_id: '',
            status: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/reports/cash/daily', {
            per_page: '15',
            sort_field: sortField,
            sort_direction: sortDirection,
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        const params: any = {
            search: searchTerm,
            sort_field: field,
            sort_direction: newDirection,
            per_page: filterData.per_page,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/cash/daily', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (value: string) => {
        setFilterData({ ...filterData, per_page: value });

        const params: any = {
            search: searchTerm,
            per_page: value,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/cash/daily', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        const params: any = {
            page: page,
            search: searchTerm,
            per_page: filterData.per_page,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/cash/daily', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const params: any = { search: searchTerm, ...filterData };
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/cash/daily/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            abierta: 'secondary',
            cerrada: 'default',
        };
        return badges[status] || 'outline';
    };

    const getDifferenceBadge = (difference: number) => {
        if (difference > 0) {
            return 'text-green-600'; // Sobrante
        } else if (difference < 0) {
            return 'text-red-600'; // Faltante
        }
        return 'text-gray-600'; // Sin diferencia
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Caja Diaria" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wallet className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Reporte de Caja Diaria</h1>
                            <p className="text-muted-foreground">
                                Detalle de sesiones y movimientos de caja
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generando...' : 'Exportar PDF'}
                    </Button>
                </div>

                {/* Filtros - Always visible */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search bar - full width at top */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar por ID de sesion o cajero..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter fields - 3 column grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Fecha Desde</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={filterData.date_from}
                                    onChange={(e) =>
                                        setFilterData({ ...filterData, date_from: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">Fecha Hasta</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={filterData.date_to}
                                    onChange={(e) =>
                                        setFilterData({ ...filterData, date_to: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="branch_id">Sucursal</Label>
                                <Select
                                    value={filterData.branch_id || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, branch_id: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="branch_id">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todas</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cash_register_id">Caja Registradora</Label>
                                <Select
                                    value={filterData.cash_register_id || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, cash_register_id: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="cash_register_id">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todas</SelectItem>
                                        {cashRegisters.map((register) => (
                                            <SelectItem key={register.id} value={register.id.toString()}>
                                                {register.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_id">Cajero</Label>
                                <Select
                                    value={filterData.user_id || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, user_id: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="user_id">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select
                                    value={filterData.status || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, status: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        <SelectItem value="abierta">Abierta</SelectItem>
                                        <SelectItem value="cerrada">Cerrada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action buttons - right aligned */}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button onClick={clearFilters} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Limpiar
                            </Button>
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Aplicar Filtros
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadisticas Resumidas */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card className="border-l-4 border-blue-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Sesiones</div>
                                <div className="text-2xl font-bold">{totals.count}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-slate-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Saldo Inicial Total</div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totals.total_opening_balance)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-amber-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Saldo Esperado</div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totals.total_expected_balance)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-green-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Saldo Real</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(totals.total_actual_balance)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-purple-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Diferencia Total</div>
                                <div
                                    className={`text-2xl font-bold ${getDifferenceBadge(
                                        totals.total_difference
                                    )}`}
                                >
                                    {formatCurrency(totals.total_difference)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabla de Sesiones */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Sesiones de Caja</CardTitle>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Mostrar:</Label>
                            <Select value={filterData.per_page} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="w-[80px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center">
                                            ID
                                            <SortIcon field="id" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('opened_at')}
                                    >
                                        <div className="flex items-center">
                                            Apertura
                                            <SortIcon field="opened_at" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Cierre</TableHead>
                                    <TableHead>Caja / Sucursal</TableHead>
                                    <TableHead>Cajero</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('opening_balance')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Saldo Inicial
                                            <SortIcon field="opening_balance" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Saldo Esperado</TableHead>
                                    <TableHead className="text-right">Saldo Real</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('difference')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Diferencia
                                            <SortIcon field="difference" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions?.data && sessions.data.length > 0 ? (
                                    sessions.data.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-medium">#{session.id}</TableCell>
                                            <TableCell>
                                                {format(new Date(session.opened_at), 'dd/MM/yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {session.closed_at
                                                    ? format(new Date(session.closed_at), 'dd/MM/yyyy HH:mm')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{session.cash_register.name}</p>
                                                    {session.cash_register.branch && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {session.cash_register.branch.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{session.user.name}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(session.opening_balance)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {session.expected_balance !== undefined
                                                    ? formatCurrency(session.expected_balance)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {session.actual_balance !== undefined
                                                    ? formatCurrency(session.actual_balance)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {session.difference !== undefined ? (
                                                    <span
                                                        className={`font-bold ${getDifferenceBadge(
                                                            session.difference
                                                        )}`}
                                                    >
                                                        {formatCurrency(session.difference)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusBadge(session.status) as any}>
                                                    {session.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 justify-center">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/cash/${session.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {session.status === 'cerrada' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                window.open(
                                                                    `/reports/cash/closing/${session.id}/pdf`,
                                                                    '_blank'
                                                                )
                                                            }
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8">
                                            <Wallet className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No se encontraron sesiones de caja con los filtros aplicados
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginacion */}
                        {sessions?.data && sessions.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{sessions.from}</span> a{' '}
                                    <span className="font-medium">{sessions.to}</span> de{' '}
                                    <span className="font-medium">{sessions.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(sessions.current_page - 1)}
                                        disabled={sessions.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, sessions.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (sessions.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (sessions.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (sessions.current_page >= sessions.last_page - 2) {
                                                pageNum = sessions.last_page - 4 + i;
                                            } else {
                                                pageNum = sessions.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        sessions.current_page === pageNum
                                                            ? 'default'
                                                            : 'outline'
                                                    }
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
                                        onClick={() => handlePageChange(sessions.current_page + 1)}
                                        disabled={sessions.current_page === sessions.last_page}
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
