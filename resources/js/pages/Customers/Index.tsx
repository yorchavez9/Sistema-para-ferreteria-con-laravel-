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
    User,
    Building2,
    Phone,
    Mail
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    email: string | null;
    phone: string | null;
    customer_type: string;
    payment_terms: string;
    credit_limit: number;
    is_active: boolean;
}

interface CustomersIndexProps {
    customers: {
        data: Customer[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        is_active?: string;
        customer_type?: string;
        document_type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clientes', href: '/customers' },
];

const customerTypeLabels: Record<string, string> = {
    'personal': 'Personal',
    'empresa': 'Empresa',
};

const paymentTermsLabels: Record<string, string> = {
    'contado': 'Contado',
    'credito_15': 'Crédito 15 días',
    'credito_30': 'Crédito 30 días',
    'credito_45': 'Crédito 45 días',
    'credito_60': 'Crédito 60 días',
};

export default function CustomersIndex({ customers, filters }: CustomersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isActive, setIsActive] = useState(filters.is_active || 'all');
    const [customerType, setCustomerType] = useState(filters.customer_type || 'all');
    const [documentType, setDocumentType] = useState(filters.document_type || 'all');

    const handleSearch = () => {
        router.get('/customers', {
            search: search || undefined,
            is_active: isActive === 'all' ? undefined : isActive,
            customer_type: customerType === 'all' ? undefined : customerType,
            document_type: documentType === 'all' ? undefined : documentType,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setIsActive('all');
        setCustomerType('all');
        setDocumentType('all');
        router.get('/customers');
    };

    const handleDelete = (customer: Customer) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el cliente "${customer.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/customers/${customer.id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            '¡Eliminado!',
                            'El cliente ha sido eliminado.',
                            'success'
                        );
                    },
                });
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Clientes</h1>
                        <p className="text-muted-foreground">
                            Gestiona la información de tus clientes
                        </p>
                    </div>
                    <Link href="/customers/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Buscar por nombre, código, documento o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-40">
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
                    <div className="w-40">
                        <Select value={customerType} onValueChange={setCustomerType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="empresa">Empresa</SelectItem>
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

                {/* Customers Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Términos de Pago</TableHead>
                                <TableHead>Límite Crédito</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.length > 0 ? (
                                customers.data.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-mono">
                                            {customer.code}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {customer.customer_type === 'empresa' ? (
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="font-medium">{customer.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {customer.document_type && customer.document_number ? (
                                                <div className="text-sm">
                                                    <span className="font-medium">{customer.document_type}:</span>{' '}
                                                    {customer.document_number}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {customerTypeLabels[customer.customer_type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {paymentTermsLabels[customer.payment_terms]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {customer.credit_limit > 0 ? (
                                                formatCurrency(customer.credit_limit)
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                                                {customer.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/customers/${customer.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/customers/${customer.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(customer)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-6">
                                        No se encontraron clientes.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {customers.data.length} de {customers.total} clientes
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}