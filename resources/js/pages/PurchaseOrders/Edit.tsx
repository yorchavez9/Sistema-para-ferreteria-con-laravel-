import { useState, useMemo, useRef, useEffect } from 'react';
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
import { ArrowLeft, Plus, Trash2, ShoppingCart, Calendar, Package, List } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';
import ProductSelectorModal from '@/components/ProductSelectorModal';

interface Supplier {
    id: number;
    business_name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
}

interface OrderDetail {
    id?: number;
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
}

interface PurchaseOrder {
    id: number;
    series: string;
    correlativo: string;
    order_number: string;
    supplier_id: number;
    branch_id: number;
    order_date: string;
    expected_date: string | null;
    discount: string;
    notes: string | null;
    details: Array<{
        id: number;
        product_id: number;
        quantity_ordered: number;
        unit_price: string;
        product: Product;
    }>;
}

interface PurchaseOrdersEditProps {
    order: PurchaseOrder;
    suppliers: Supplier[];
    branches: Branch[];
    products: Product[];
}

export default function PurchaseOrdersEdit({ order, suppliers, branches, products }: PurchaseOrdersEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Órdenes de Compra', href: '/purchase-orders' },
        { title: `Editar ${order.order_number}`, href: '#' },
    ];

    const [formData, setFormData] = useState({
        series: order.series,
        correlativo: order.correlativo,
        supplier_id: order.supplier_id.toString(),
        branch_id: order.branch_id.toString(),
        order_date: order.order_date.split('T')[0], // Convertir de ISO a YYYY-MM-DD
        expected_date: order.expected_date ? order.expected_date.split('T')[0] : '',
        discount: order.discount?.toString() || '',
        notes: order.notes || '',
    });

    const [details, setDetails] = useState<OrderDetail[]>(
        order.details.map(detail => ({
            id: detail.id,
            product_id: detail.product_id,
            product: detail.product,
            quantity: detail.quantity_ordered,
            unit_price: parseFloat(detail.unit_price),
        }))
    );

    const [selectedProductId, setSelectedProductId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showProductModal, setShowProductModal] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const search = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category?.name.toLowerCase().includes(search) ||
            product.brand?.name.toLowerCase().includes(search)
        ).slice(0, 10); // Limit to 10 results
    }, [products, searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show dropdown when typing
    useEffect(() => {
        if (searchTerm.trim()) {
            setShowDropdown(true);
            setHighlightedIndex(-1);
        } else {
            setShowDropdown(false);
        }
    }, [searchTerm]);

    // Calculate totals
    const subtotal = useMemo(() => {
        return details.reduce((sum, detail) => sum + (detail.quantity * detail.unit_price), 0);
    }, [details]);

    const tax = useMemo(() => subtotal * 0.18, [subtotal]);
    const discount = useMemo(() => parseFloat(formData.discount) || 0, [formData.discount]);
    const total = useMemo(() => subtotal + tax - discount, [subtotal, tax, discount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (details.length === 0) {
            showError('Error de validación', 'Debes agregar al menos un producto.');
            return;
        }

        setLoading(true);

        const hasInvalidQuantity = details.some(detail => detail.quantity <= 0);
        if (hasInvalidQuantity) {
            showError('Error de validación', 'Todas las cantidades deben ser mayores a 0.');
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

        router.put(`/purchase-orders/${order.id}`, submitData, {
            onSuccess: () => {
                showSuccess('¡Orden actualizada!', 'La orden de compra ha sido actualizada exitosamente.');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                setErrors(errors);

                const errorMessages = Object.entries(errors).map(([field, messages]) => {
                    const messageArray = Array.isArray(messages) ? messages : [messages];
                    return `${field}: ${messageArray.join(', ')}`;
                }).join('\n');

                showError('Error al actualizar orden', errorMessages || 'Por favor, revisa los campos y vuelve a intentar.');
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

    const addProductById = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Check if product already exists in details
        const existingIndex = details.findIndex(d => d.product_id === productId);
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

        setSearchTerm('');
        setShowDropdown(false);
        setHighlightedIndex(-1);

        // Focus back on search input
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || filteredProducts.length === 0) {
            // If Enter is pressed and no dropdown, try to find exact match by code
            if (e.key === 'Enter') {
                e.preventDefault();
                const exactMatch = products.find(p =>
                    p.code.toLowerCase() === searchTerm.toLowerCase().trim()
                );
                if (exactMatch) {
                    addProductById(exactMatch.id);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredProducts.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
                    addProductById(filteredProducts[highlightedIndex].id);
                } else if (filteredProducts.length > 0) {
                    addProductById(filteredProducts[0].id);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
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
            <Head title={`Editar Orden ${order.order_number}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Editar Orden de Compra</h1>
                        <p className="text-muted-foreground mt-1">
                            Orden: {order.order_number}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/purchase-orders">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
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
                                        disabled
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
                                        disabled
                                    />
                                    {errors.correlativo && (
                                        <p className="text-xs text-destructive mt-1">{errors.correlativo}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Label>Número Completo</Label>
                                    <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-mono text-lg font-semibold">
                                        {order.order_number}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        El número de orden no puede modificarse
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="supplier">Proveedor *</Label>
                                    <Select
                                        value={formData.supplier_id}
                                        onValueChange={(value) => handleChange('supplier_id', value)}
                                    >
                                        <SelectTrigger id="supplier">
                                            <SelectValue placeholder="Selecciona un proveedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                    {supplier.business_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.supplier_id && (
                                        <p className="text-xs text-destructive mt-1">{errors.supplier_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="branch">Sucursal *</Label>
                                    <Select
                                        value={formData.branch_id}
                                        onValueChange={(value) => handleChange('branch_id', value)}
                                    >
                                        <SelectTrigger id="branch">
                                            <SelectValue placeholder="Selecciona una sucursal" />
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
                                        <p className="text-xs text-destructive mt-1">{errors.branch_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="order_date">Fecha de Orden *</Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => handleChange('order_date', e.target.value)}
                                    />
                                    {errors.order_date && (
                                        <p className="text-xs text-destructive mt-1">{errors.order_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="expected_date">Fecha Esperada</Label>
                                    <Input
                                        id="expected_date"
                                        type="date"
                                        value={formData.expected_date}
                                        onChange={(e) => handleChange('expected_date', e.target.value)}
                                    />
                                    {errors.expected_date && (
                                        <p className="text-xs text-destructive mt-1">{errors.expected_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="discount">Descuento (S/)</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.discount}
                                        onChange={(e) => handleChange('discount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.discount && (
                                        <p className="text-xs text-destructive mt-1">{errors.discount}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Observaciones adicionales..."
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-xs text-destructive mt-1">{errors.notes}</p>
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
                            <div className="relative">
                                <Label htmlFor="product-search">Buscar Producto</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="relative flex-1">
                                        <Input
                                            ref={searchInputRef}
                                            id="product-search"
                                            placeholder="Escribe el código de barras o nombre del producto..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleSearchKeyDown}
                                            autoComplete="off"
                                            className="pr-10"
                                        />
                                        <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowProductModal(true)}
                                    >
                                        <List className="h-4 w-4 mr-2" />
                                        Ver Catálogo
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Escribe para buscar o escanea el código de barras y presiona Enter
                                </p>

                                {/* Dropdown Results */}
                                {showDropdown && filteredProducts.length > 0 && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-auto"
                                    >
                                        {filteredProducts.map((product, index) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => addProductById(product.id)}
                                                className={`w-full text-left px-4 py-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0 ${
                                                    index === highlightedIndex ? 'bg-accent' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-block px-2 py-1 text-xs font-mono font-semibold bg-primary/10 text-primary rounded">
                                                            {product.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {product.category?.name || 'Sin categoría'} • {product.brand?.name || 'Sin marca'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No Results Message */}
                                {showDropdown && searchTerm && filteredProducts.length === 0 && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4"
                                    >
                                        <p className="text-sm text-muted-foreground text-center">
                                            No se encontraron productos
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Lista de Productos */}
                            {details.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Marca</TableHead>
                                                <TableHead className="w-32">Cantidad</TableHead>
                                                <TableHead className="w-32">Precio Unit.</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead className="w-20"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-mono">{detail.product?.code || '-'}</TableCell>
                                                    <TableCell>{detail.product?.name || '-'}</TableCell>
                                                    <TableCell>{detail.product?.category?.name || '-'}</TableCell>
                                                    <TableCell>{detail.product?.brand?.name || '-'}</TableCell>
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
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        S/ {(detail.quantity * detail.unit_price).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeProduct(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay productos agregados
                                </div>
                            )}

                            {/* Totales */}
                            {details.length > 0 && (
                                <div className="flex justify-end">
                                    <div className="w-full max-w-sm space-y-2">
                                        <div className="flex justify-between text-base">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-base">
                                            <span>IGV (18%):</span>
                                            <span className="font-semibold">S/ {tax.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-base">
                                                <span>Descuento:</span>
                                                <span className="font-semibold text-destructive">- S/ {discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xl font-bold border-t pt-2">
                                            <span>Total:</span>
                                            <span>S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botones de Acción */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/purchase-orders">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading || details.length === 0}>
                            {loading ? 'Guardando...' : 'Actualizar Orden'}
                        </Button>
                    </div>
                </form>

                {/* Product Selector Modal */}
                <ProductSelectorModal
                    open={showProductModal}
                    onClose={() => setShowProductModal(false)}
                    products={products}
                    onAddProduct={addProductById}
                />
            </div>
        </AppLayout>
    );
}