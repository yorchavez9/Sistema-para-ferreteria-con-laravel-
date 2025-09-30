import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    Building2,
    Phone,
    Mail
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Supplier {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    email: string | null;
    phone: string | null;
    contact_person: string | null;
    payment_terms: string;
    is_active: boolean;
}

interface SuppliersIndexProps {
    suppliers: {
        data: Supplier[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        is_active?: string;
        document_type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proveedores', href: '/suppliers' },
];

const paymentTermsLabels: Record<string, string> = {
    'contado': 'Contado',
    'credito_15': 'Crédito 15 días',
    'credito_30': 'Crédito 30 días',
    'credito_45': 'Crédito 45 días',
    'credito_60': 'Crédito 60 días',
};

export default function SuppliersIndex({ suppliers, filters }: SuppliersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isActive, setIsActive] = useState(filters.is_active || 'all');
    const [documentType, setDocumentType] = useState(filters.document_type || 'all');

    const handleSearch = () => {
        router.get('/suppliers', {
            search: search || undefined,
            is_active: isActive === 'all' ? undefined : isActive,
            document_type: documentType === 'all' ? undefined : documentType,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setIsActive('all');
        setDocumentType('all');
        router.get('/suppliers');
    };

    const handleDelete = (supplier: Supplier) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el proveedor "${supplier.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/suppliers/${supplier.id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            '¡Eliminado!',
                            'El proveedor ha sido eliminado.',
                            'success'
                        );
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proveedores" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Proveedores</h1>
                        <p className="text-muted-foreground">
                            Gestiona la información de tus proveedores
                        </p>
                    </div>
                    <Link href="/suppliers/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nombre, código, documento o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-48">
                        <Select value={isActive} onValueChange={setIsActive}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="1">Activos</SelectItem>
                                <SelectItem value="0">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48">
                        <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo documento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="RUC">RUC</SelectItem>
                                <SelectItem value="DNI">DNI</SelectItem>
                                <SelectItem value="CE">Carnet de Extranjería</SelectItem>
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

                {/* Suppliers Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Términos de Pago</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.data.length > 0 ? (
                                suppliers.data.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-mono">
                                            {supplier.code}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{supplier.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {supplier.document_type && supplier.document_number ? (
                                                <div className="text-sm">
                                                    <span className="font-medium">{supplier.document_type}:</span>{' '}
                                                    {supplier.document_number}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                {supplier.contact_person && (
                                                    <div className="text-muted-foreground">
                                                        {supplier.contact_person}
                                                    </div>
                                                )}
                                                {supplier.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {supplier.phone}
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {supplier.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {paymentTermsLabels[supplier.payment_terms]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                                                {supplier.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/suppliers/${supplier.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/suppliers/${supplier.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(supplier)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6">
                                        No se encontraron proveedores.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {suppliers.data.length} de {suppliers.total} proveedores
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}