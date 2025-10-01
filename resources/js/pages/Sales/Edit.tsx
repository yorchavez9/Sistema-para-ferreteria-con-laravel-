import { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    TableRow
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Save,
    User,
    Search,
    ShoppingCart,
    X,
    Plus,
    Minus,
    Package
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import CustomerSearchModal from '@/components/CustomerSearchModal';
import ProductSelectorModal from '@/components/ProductSelectorModal';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    code: string;
    barcode?: string;
    sale_price: number;
    unit: string;
    stock?: number;
}

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string;
    document_number: string;
    phone?: string;
    email?: string;
    address?: string;
}

interface Branch {
    id: number;
    name: string;
}

interface DocumentSeries {
    id: number;
    series: string;
    current_number: number;
    is_default: boolean;
}

interface SaleDetail {
    id?: number;
    product_id: number;
    product: Product;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Sale {
    id: number;
    sale_number: string;
    series: string;
    correlativo: string;
    document_type: string;
    document_series_id?: number;
    sale_date: string;
    payment_method: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    amount_paid: number;
    change_amount: number;
    notes?: string;
    status: string;
    customer_id: number;
    customer: Customer;
    branch_id: number;
    branch: Branch;
    details: SaleDetail[];
}

interface SaleEditProps {
    sale: Sale;
    branches: Branch[];
    available_series: DocumentSeries[];
}

export default function SaleEdit({ sale, branches, available_series }: SaleEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ventas', href: '/sales' },
        { title: sale.sale_number, href: `/sales/${sale.id}` },
        { title: 'Editar', href: `/sales/${sale.id}/edit` },
    ];

    // Solo permitir editar ventas pendientes
    useEffect(() => {
        if (sale.status !== 'pendiente') {
            Swal.fire({
                title: 'No permitido',
                text: 'Solo se pueden editar ventas con estado pendiente.',
                icon: 'warning',
            }).then(() => {
                router.visit(`/sales/${sale.id}`);
            });
        }
    }, [sale.status, sale.id]);

    const [formData, setFormData] = useState({
        branch_id: sale.branch_id.toString(),
        document_type: sale.document_type,
        document_series_id: sale.document_series_id?.toString() || '',
        sale_date: sale.sale_date,
        payment_method: sale.payment_method,
        discount: sale.discount.toString(),
        amount_paid: sale.amount_paid.toString(),
        notes: sale.notes || '',
    });

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(sale.customer);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [products, setProducts] = useState<SaleDetail[]>(sale.details);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Búsqueda de productos
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
    const [searching, setSearching] = useState(false);

    const [availableSeries, setAvailableSeries] = useState<DocumentSeries[]>(available_series);

    // Actualizar series disponibles cuando cambie el tipo de documento o sucursal
    useEffect(() => {
        if (formData.document_type !== 'nota_venta') {
            const fetchSeries = async () => {
                try {
                    const response = await axios.get('/sales/create', {
                        params: {
                            branch_id: formData.branch_id,
                            document_type: formData.document_type,
                        }
                    });
                    setAvailableSeries(response.data.props.available_series || []);
                } catch (error) {
                    console.error('Error fetching series:', error);
                }
            };
            fetchSeries();
        }
    }, [formData.branch_id, formData.document_type]);

    // Búsqueda en tiempo real
    useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        const delaySearch = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await axios.get('/api/products/search', {
                    params: {
                        search: searchTerm,
                        branch_id: formData.branch_id,
                    }
                });
                setSearchResults(response.data.products || []);
                setShowSearchDropdown(true);
                setSelectedSearchIndex(-1);
            } catch (error) {
                console.error('Error buscando productos:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, formData.branch_id]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSearchDropdown || searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSearchIndex(prev =>
                prev < searchResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSearchIndex >= 0) {
                handleAddProduct(searchResults[selectedSearchIndex]);
            } else if (searchResults.length === 1) {
                handleAddProduct(searchResults[0]);
            }
        } else if (e.key === 'Escape') {
            setShowSearchDropdown(false);
            setSelectedSearchIndex(-1);
        }
    };

    const handleAddProduct = (product: Product) => {
        const existingIndex = products.findIndex(p => p.product_id === product.id);

        if (existingIndex >= 0) {
            const updated = [...products];
            updated[existingIndex].quantity += 1;
            updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unit_price;
            setProducts(updated);
        } else {
            setProducts([...products, {
                product_id: product.id,
                product: product,
                quantity: 1,
                unit_price: product.sale_price,
                subtotal: product.sale_price,
            }]);
        }

        setSearchTerm('');
        setShowSearchDropdown(false);
        setSearchResults([]);
        setSelectedSearchIndex(-1);
    };

    const handleRemoveProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        if (quantity < 1) return;
        const updated = [...products];
        updated[index].quantity = quantity;
        updated[index].subtotal = quantity * updated[index].unit_price;
        setProducts(updated);
    };

    const handlePriceChange = (index: number, price: number) => {
        if (price < 0) return;
        const updated = [...products];
        updated[index].unit_price = price;
        updated[index].subtotal = updated[index].quantity * price;
        setProducts(updated);
    };

    const subtotal = useMemo(() => {
        return products.reduce((sum, item) => sum + item.subtotal, 0);
    }, [products]);

    const tax = useMemo(() => {
        return formData.document_type === 'factura' ? subtotal * 0.18 : 0;
    }, [subtotal, formData.document_type]);

    const total = useMemo(() => {
        const discount = parseFloat(formData.discount) || 0;
        return subtotal + tax - discount;
    }, [subtotal, tax, formData.discount]);

    const changeAmount = useMemo(() => {
        const paid = parseFloat(formData.amount_paid) || 0;
        return Math.max(0, paid - total);
    }, [formData.amount_paid, total]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!selectedCustomer) {
            Swal.fire('Error', 'Debes seleccionar un cliente', 'error');
            return;
        }

        if (products.length === 0) {
            Swal.fire('Error', 'Debes agregar al menos un producto', 'error');
            return;
        }

        const paid = parseFloat(formData.amount_paid) || 0;
        if (paid < total) {
            Swal.fire('Error', 'El monto pagado debe ser igual o mayor al total', 'error');
            return;
        }

        setSubmitting(true);

        const submitData = {
            ...formData,
            customer_id: selectedCustomer.id,
            discount: parseFloat(formData.discount) || 0,
            amount_paid: paid,
            products: products.map(p => ({
                product_id: p.product_id,
                quantity: p.quantity,
                unit_price: p.unit_price,
            })),
        };

        router.put(`/sales/${sale.id}`, submitData, {
            onSuccess: () => {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Venta actualizada correctamente',
                    icon: 'success',
                }).then(() => {
                    router.visit(`/sales/${sale.id}`);
                });
            },
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                Swal.fire('Error', 'Hubo un error al actualizar la venta', 'error');
            },
            onFinish: () => {
                setSubmitting(false);
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
            <Head title={`Editar Venta ${sale.sale_number}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/sales/${sale.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Editar Venta</h1>
                            <p className="text-muted-foreground mt-1">
                                Venta: {sale.sale_number}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sale Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Venta</CardTitle>
                            <CardDescription>
                                Complete los datos de la venta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="branch_id">Sucursal *</Label>
                                    <Select
                                        value={formData.branch_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, branch_id: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar sucursal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.branch_id && (
                                        <p className="text-sm text-red-600 mt-1">{errors.branch_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="document_type">Tipo de Documento *</Label>
                                    <Select
                                        value={formData.document_type}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, document_type: value })
                                        }
                                        disabled
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="boleta">Boleta</SelectItem>
                                            <SelectItem value="factura">Factura</SelectItem>
                                            <SelectItem value="nota_venta">Nota de Venta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        El tipo de documento no se puede cambiar
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="sale_date">Fecha de Venta *</Label>
                                    <Input
                                        id="sale_date"
                                        type="date"
                                        value={formData.sale_date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sale_date: e.target.value })
                                        }
                                    />
                                    {errors.sale_date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.sale_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Número de Venta</Label>
                                    <Input
                                        value={sale.sale_number}
                                        disabled
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        El número de venta no se puede cambiar
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="payment_method">Método de Pago *</Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, payment_method: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar método" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                            <SelectItem value="yape">Yape</SelectItem>
                                            <SelectItem value="plin">Plin</SelectItem>
                                            <SelectItem value="credito">Crédito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_method && (
                                        <p className="text-sm text-red-600 mt-1">{errors.payment_method}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedCustomer ? (
                                <Button
                                    type="button"
                                    onClick={() => setShowCustomerModal(true)}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Buscar o Crear Cliente
                                </Button>
                            ) : (
                                <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <div>
                                                <span className="text-sm text-muted-foreground">Código:</span>
                                                <p className="font-semibold font-mono">{selectedCustomer.code}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted-foreground">Nombre:</span>
                                                <p className="font-semibold">{selectedCustomer.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted-foreground">Documento:</span>
                                                <p className="font-mono">
                                                    {selectedCustomer.document_type}: {selectedCustomer.document_number}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowCustomerModal(true)}
                                        >
                                            Cambiar Cliente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Productos
                            </CardTitle>
                            <CardDescription>
                                Busca y agrega productos a la venta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 relative">
                                    <Label htmlFor="search-product">Buscar Producto</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search-product"
                                            placeholder="Buscar por nombre, código o escanear código de barras..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleSearchKeyDown}
                                            onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                                            className="pl-9"
                                        />
                                    </div>

                                    {/* Dropdown de búsqueda */}
                                    {showSearchDropdown && searchResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                            {searchResults.map((product, index) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => handleAddProduct(product)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 border-b last:border-b-0 ${index === selectedSearchIndex ? 'bg-muted' : ''
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-semibold">{product.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Código: {product.code} {product.barcode && `| Barras: ${product.barcode}`}
                                                            </p>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <p className="font-semibold text-primary">
                                                                {formatCurrency(product.sale_price)}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Stock: {product.stock || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowProductModal(true)}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Ver Catálogo
                                </Button>
                            </div>

                            {/* Tabla de productos */}
                            {products.length > 0 && (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="w-32">Cantidad</TableHead>
                                                <TableHead className="w-40">Precio Unit.</TableHead>
                                                <TableHead className="w-32">Subtotal</TableHead>
                                                <TableHead className="w-16"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{item.product.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.product.code} | {item.product.unit}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    handleQuantityChange(index, parseInt(e.target.value) || 1)
                                                                }
                                                                className="w-16 text-center"
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.unit_price}
                                                            onChange={(e) =>
                                                                handlePriceChange(index, parseFloat(e.target.value) || 0)
                                                            }
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {formatCurrency(item.subtotal)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveProduct(index)}
                                                        >
                                                            <X className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {products.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No hay productos agregados</p>
                                    <p className="text-sm">Busca productos usando el campo superior o el catálogo</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Totals and Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Observaciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Notas adicionales (opcional)"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={6}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Totales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {formData.document_type === 'factura' && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">IGV (18%):</span>
                                            <span className="font-semibold">{formatCurrency(tax)}</span>
                                        </div>
                                    )}
                                    <div>
                                        <Label htmlFor="discount">Descuento</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.discount}
                                            onChange={(e) =>
                                                setFormData({ ...formData, discount: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-between pt-3 border-t text-lg">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-bold text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t space-y-3">
                                    <div>
                                        <Label htmlFor="amount_paid">Monto Pagado *</Label>
                                        <Input
                                            id="amount_paid"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount_paid}
                                            onChange={(e) =>
                                                setFormData({ ...formData, amount_paid: e.target.value })
                                            }
                                            placeholder="0.00"
                                        />
                                        {errors.amount_paid && (
                                            <p className="text-sm text-red-600 mt-1">{errors.amount_paid}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vuelto:</span>
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(changeAmount)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={`/sales/${sale.id}`}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={submitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {submitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Modals */}
            <CustomerSearchModal
                open={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onSelectCustomer={(customer) => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                }}
            />

            <ProductSelectorModal
                open={showProductModal}
                onClose={() => setShowProductModal(false)}
                onSelectProduct={handleAddProduct}
                branchId={parseInt(formData.branch_id)}
            />
        </AppLayout>
    );
}