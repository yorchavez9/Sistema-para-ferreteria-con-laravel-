import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Package, Search, Settings2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface InventoryItem {
    id: number;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    product: {
        id: number;
        name: string;
        code: string;
        unit_of_measure: string;
        category: {
            name: string;
        };
        brand: {
            name: string;
        };
    };
    branch: {
        id: number;
        name: string;
    };
}

interface Branch {
    id: number;
    name: string;
}

interface AdjustmentProps {
    inventory: InventoryItem[];
    branches: Branch[];
    filters: {
        branch_id?: string;
        search?: string;
    };
}

interface AdjustmentData {
    inventory_id: number;
    new_stock: number;
    reason: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventario', href: '/inventory' },
    { title: 'Ajuste de Stock', href: '/inventory/adjustment' },
];

export default function Adjustment({ inventory, branches, filters }: AdjustmentProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<AdjustmentData>({
        inventory_id: 0,
        new_stock: 0,
        reason: '',
    });

    const handleSearch = () => {
        router.get('/inventory/adjustment', {
            search: search || undefined,
            branch_id: branchId === 'all' ? undefined : branchId,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setBranchId('all');
        router.get('/inventory/adjustment');
    };

    const openAdjustmentDialog = (item: InventoryItem) => {
        setSelectedItem(item);
        setData({
            inventory_id: item.id,
            new_stock: item.current_stock,
            reason: '',
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedItem(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/inventory/adjustment', {
            preserveScroll: true,
            onSuccess: () => {
                closeDialog();
                showSuccess('¡Ajuste realizado!', 'El inventario ha sido actualizado exitosamente.');
            },
        });
    };

    const getDifference = () => {
        if (!selectedItem) return 0;
        return data.new_stock - selectedItem.current_stock;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajuste de Inventario" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings2 className="h-8 w-8" />
                            Ajuste de Inventario
                        </h1>
                        <p className="text-muted-foreground">
                            Actualiza el stock de productos manualmente
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nombre o código de producto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-64">
                        <Select value={branchId} onValueChange={setBranchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las sucursales" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las sucursales</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Limpiar
                    </Button>
                </div>

                {/* Inventory Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead>Stock Actual</TableHead>
                                    <TableHead>Rango</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.length > 0 ? (
                                    inventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.code} • {item.product.category.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.brand.name}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.branch.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {item.current_stock}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.product.unit_of_measure}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    Mín: {item.min_stock} • Máx: {item.max_stock}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openAdjustmentDialog(item)}
                                                >
                                                    <Settings2 className="mr-2 h-4 w-4" />
                                                    Ajustar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground">
                                                    No se encontraron productos
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Intenta ajustar los filtros de búsqueda
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Adjustment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Ajustar Stock</DialogTitle>
                            <DialogDescription asChild>
                                <div>
                                    {selectedItem && (
                                        <div className="mt-2">
                                            <p className="font-medium">{selectedItem.product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedItem.product.code} - {selectedItem.branch.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {selectedItem && (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Stock Actual
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {selectedItem.current_stock}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Nuevo Stock
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-primary">
                                                    {data.new_stock}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Diferencia
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className={`text-2xl font-bold ${
                                                    getDifference() > 0 ? 'text-green-600' :
                                                    getDifference() < 0 ? 'text-red-600' : ''
                                                }`}>
                                                    {getDifference() > 0 ? '+' : ''}{getDifference()}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new_stock">Nuevo Stock *</Label>
                                        <Input
                                            id="new_stock"
                                            type="number"
                                            min="0"
                                            value={data.new_stock}
                                            onChange={(e) => setData('new_stock', parseInt(e.target.value) || 0)}
                                            className={errors.new_stock ? 'border-red-500' : ''}
                                        />
                                        {errors.new_stock && (
                                            <p className="text-sm text-red-500">{errors.new_stock}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Motivo del Ajuste</Label>
                                        <Textarea
                                            id="reason"
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            placeholder="Ej. Reconteo físico, corrección de error, merma, etc."
                                            rows={3}
                                            className={errors.reason ? 'border-red-500' : ''}
                                        />
                                        {errors.reason && (
                                            <p className="text-sm text-red-500">{errors.reason}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                                disabled={processing}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Ajuste'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}