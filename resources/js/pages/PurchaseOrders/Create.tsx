import { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, ShoppingCart, Calendar, Package } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Supplier {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
    category: {
        name: string;
    };
    brand: {
        name: string;
    };
}

interface OrderDetail {
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
}

interface PurchaseOrdersCreateProps {
    suppliers: Supplier[];
    branches: Branch[];
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Órdenes de Compra', href: '/purchase-orders' },
    { title: 'Crear', href: '/purchase-orders/create' },
];

export default function PurchaseOrdersCreate({ suppliers, branches, products }: PurchaseOrdersCreateProps) {
    const [formData, setFormData] = useState({
        series: '',
        correlativo: '',
        supplier_id: '',
        branch_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        discount: '',
        notes: '',
    });

    const [details, setDetails] = useState<OrderDetail[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const search = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category.name.toLowerCase().includes(search) ||
            product.brand.name.toLowerCase().includes(search)
        );
    }, [products, searchTerm]);

    // Calculate totals
    const subtotal = useMemo(() => {
        return details.reduce((sum, detail) => sum + (detail.quantity * detail.unit_price), 0);
    }, [details]);

    const igv = useMemo(() => {
        return subtotal * 0.18;
    }, [subtotal]);

    const discount = useMemo(() => {
        return parseFloat(formData.discount) || 0;
    }, [formData.discount]);

    const total = useMemo(() => {
        return subtotal + igv - discount;
    }, [subtotal, igv, discount]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validation
        if (details.length === 0) {
            showError('Error de validación', 'Debe agregar al menos un producto a la orden.');
            setLoading(false);
            return;
        }

        const hasInvalidQuantity = details.some(detail => detail.quantity < 1);
        if (hasInvalidQuantity) {
            showError('Error de validación', 'Todas las cantidades deben ser mayores o iguales a 1.');
            setLoading(false);
            return;
        }

        const hasInvalidPrice = details.some(detail => detail.unit_price < 0);
        if (hasInvalidPrice) {
            showError('Error de validación', 'Todos los precios deben ser mayores o iguales a 0.');
            setLoading(false);
            return;
        }

        const submitData = {
            series: formData.series,
            correlativo: formData.correlativo,
            supplier_id: formData.supplier_id,
            branch_id: formData.branch_id,
            order_date: formData.order_date,
            expected_date: formData.expected_date || null,
            discount: formData.discount || 0,
            notes: formData.notes || null,
            details: details.map(detail => ({
                product_id: detail.product_id,
                quantity: detail.quantity,
                unit_price: detail.unit_price,
            })),
        };

        console.log('Submitting data:', submitData);

        router.post('/purchase-orders', submitData, {
            onSuccess: () => {
                showSuccess('¡Orden creada!', 'La orden de compra ha sido creada exitosamente.');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                setErrors(errors);

                // Mostrar errores específicos
                const errorMessages = Object.entries(errors).map(([field, messages]) => {
                    const messageArray = Array.isArray(messages) ? messages : [messages];
                    return `${field}: ${messageArray.join(', ')}`;
                }).join('\n');

                showError('Error al crear orden', errorMessages || 'Por favor, revisa los campos y vuelve a intentar.');
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addProduct = () => {
        if (!selectedProductId) return;

        const product = products.find(p => p.id.toString() === selectedProductId);
        if (!product) return;

        // Check if product already exists in details
        const existingIndex = details.findIndex(d => d.product_id.toString() === selectedProductId);
        if (existingIndex !== -1) {
            // If exists, increment quantity
            const newDetails = [...details];
            newDetails[existingIndex].quantity += 1;
            setDetails(newDetails);
        } else {
            // Add new product
            setDetails([...details, {
                product_id: product.id,
                product: product,
                quantity: 1,
                unit_price: 0,
            }]);
        }

        setSelectedProductId('');
        setSearchTerm('');
    };

    const removeProduct = (index: number) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const updateDetail = (index: number, field: 'quantity' | 'unit_price', value: string) => {
        const newDetails = [...details];
        const numValue = parseFloat(value) || 0;
        newDetails[index][field] = numValue;
        setDetails(newDetails);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Orden de Compra" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/purchase-orders">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Crear Orden de Compra</h1>
                        <p className="text-muted-foreground">
                            Registra una nueva orden de compra de productos
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="series">Serie * <span className="text-xs font-normal">(Ej: O001, OC-2025)</span></Label>
                                    <Input
                                        id="series"
                                        value={formData.series}
                                        onChange={(e) => {
                                            setFormData({ ...formData, series: e.target.value.toUpperCase() });
                                        }}
                                        placeholder="O001"
                                        className="font-mono"
                                        maxLength={20}
                                    />
                                    {errors.series && (
                                        <p className="text-xs text-destructive mt-1">{errors.series}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="correlativo">Correlativo * <span className="text-xs font-normal">(Ej: 1, 123, 4433)</span></Label>
                                    <Input
                                        id="correlativo"
                                        value={formData.correlativo}
                                        onChange={(e) => {
                                            setFormData({ ...formData, correlativo: e.target.value });
                                        }}
                                        placeholder="1"
                                        className="font-mono"
                                        maxLength={20}
                                    />
                                    {errors.correlativo && (
                                        <p className="text-xs text-destructive mt-1">{errors.correlativo}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Label>Número Completo</Label>
                                    <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-mono text-lg font-semibold">
                                        {formData.series && formData.correlativo
                                            ? `${formData.series}-${formData.correlativo}`
                                            : 'Ingrese serie y correlativo'}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Los números se ingresan manualmente en órdenes de compra
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="supplier_id">Proveedor *</Label>
                                    <Select
                                        value={formData.supplier_id}
                                        onValueChange={(value) => handleChange('supplier_id', value)}
                                    >
                                        <SelectTrigger className={errors.supplier_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccionar proveedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.supplier_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.supplier_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="branch_id">Sucursal *</Label>
                                    <Select
                                        value={formData.branch_id}
                                        onValueChange={(value) => handleChange('branch_id', value)}
                                    >
                                        <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
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
                                        <p className="text-sm text-red-500 mt-1">{errors.branch_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="order_date" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha de Orden *
                                    </Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => handleChange('order_date', e.target.value)}
                                        className={errors.order_date ? 'border-red-500' : ''}
                                    />
                                    {errors.order_date && (
                                        <p className="text-sm text-red-500 mt-1">{errors.order_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="expected_date" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha Esperada de Entrega
                                    </Label>
                                    <Input
                                        id="expected_date"
                                        type="date"
                                        value={formData.expected_date}
                                        onChange={(e) => handleChange('expected_date', e.target.value)}
                                        className={errors.expected_date ? 'border-red-500' : ''}
                                    />
                                    {errors.expected_date && (
                                        <p className="text-sm text-red-500 mt-1">{errors.expected_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="discount">Descuento (PEN)</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.discount}
                                        onChange={(e) => handleChange('discount', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.discount ? 'border-red-500' : ''}
                                    />
                                    {errors.discount && (
                                        <p className="text-sm text-red-500 mt-1">{errors.discount}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notas / Observaciones</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Notas adicionales sobre la orden..."
                                    className={errors.notes ? 'border-red-500' : ''}
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Productos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Product Selector */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Buscar producto por nombre, código, categoría o marca..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="w-96">
                                    <Select
                                        value={selectedProductId}
                                        onValueChange={setSelectedProductId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map((product) => (
                                                    <SelectItem key={product.id} value={product.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{product.code} - {product.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {product.category.name} | {product.brand.name}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-results" disabled>
                                                    No se encontraron productos
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="button"
                                    onClick={addProduct}
                                    disabled={!selectedProductId}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar
                                </Button>
                            </div>

                            {/* Products Table */}
                            {details.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Marca</TableHead>
                                                <TableHead className="w-32">Cantidad</TableHead>
                                                <TableHead className="w-40">Precio Unit.</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead className="w-20"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-mono text-sm">
                                                        {detail.product?.code}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {detail.product?.name}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {detail.product?.category.name}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {detail.product?.brand.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={detail.quantity}
                                                            onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={detail.unit_price}
                                                            onChange={(e) => updateDetail(index, 'unit_price', e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(detail.quantity * detail.unit_price)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeProduct(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-2">No hay productos agregados</p>
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona un producto del menú desplegable y haz clic en "Agregar"
                                    </p>
                                </div>
                            )}

                            {/* Totals */}
                            {details.length > 0 && (
                                <div className="flex justify-end">
                                    <div className="w-80 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">IGV (18%):</span>
                                            <span className="font-medium">{formatCurrency(igv)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Descuento:</span>
                                                <span className="font-medium text-red-500">-{formatCurrency(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Total:</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={loading || details.length === 0}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {loading ? 'Creando...' : 'Crear Orden de Compra'}
                        </Button>
                        <Link href="/purchase-orders">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        {details.length === 0 && (
                            <span className="text-sm text-muted-foreground">
                                Agrega al menos un producto para crear la orden
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}