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
import { ArrowLeft, Plus, Trash2, ShoppingCart, Calendar, Package, List, Search, Loader2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';
import ProductSelectorModal from '@/components/ProductSelectorModal';
import axios from 'axios';

interface Supplier {
    id?: number;
    name: string;
    code?: string;
    document_type?: string;
    document_number?: string;
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
    sale_price: number;
}

interface PurchaseOrdersCreateProps {
    defaultBranchId?: number;
    suppliers: Supplier[];
    branches: Branch[];
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Órdenes de Compra', href: '/purchase-orders' },
    { title: 'Crear', href: '/purchase-orders/create' },
];

export default function PurchaseOrdersCreate({ defaultBranchId, suppliers, branches, products }: PurchaseOrdersCreateProps) {
    const [formData, setFormData] = useState({
        series: '',
        correlativo: '',
        supplier_id: '',
        branch_id: defaultBranchId ? defaultBranchId.toString() : (branches[0]?.id.toString() || ''),
        order_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        discount: '',
        notes: '',
    });

    const [details, setDetails] = useState<OrderDetail[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showProductModal, setShowProductModal] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Supplier search states
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const supplierSearchRef = useRef<HTMLInputElement>(null);
    const supplierDropdownRef = useRef<HTMLDivElement>(null);

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const search = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category.name.toLowerCase().includes(search) ||
            product.brand.name.toLowerCase().includes(search)
        ).slice(0, 10); // Limit to 10 results
    }, [products, searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node) &&
                supplierSearchRef.current && !supplierSearchRef.current.contains(event.target as Node)) {
                setShowSupplierDropdown(false);
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

    // Supplier search
    useEffect(() => {
        const searchSuppliers = async () => {
            if (supplierSearch.length < 2) {
                setSupplierResults([]);
                setShowSupplierDropdown(false);
                return;
            }

            setSupplierLoading(true);
            try {
                const response = await axios.get('/api/suppliers/search', {
                    params: { q: supplierSearch }
                });
                setSupplierResults(response.data);
                setShowSupplierDropdown(true);
            } catch (error) {
                console.error('Error searching suppliers:', error);
                setSupplierResults([]);
            } finally {
                setSupplierLoading(false);
            }
        };

        const debounce = setTimeout(searchSuppliers, 300);
        return () => clearTimeout(debounce);
    }, [supplierSearch]);

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
                sale_price: detail.sale_price,
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

    const handleSelectSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        if (supplier.id) {
            setFormData(prev => ({ ...prev, supplier_id: supplier.id!.toString() }));
        }
        setSupplierSearch('');
        setShowSupplierDropdown(false);
    };

    const handleClearSupplier = () => {
        setSelectedSupplier(null);
        setFormData(prev => ({ ...prev, supplier_id: '' }));
    };

    const handleQuickExternalSearchSupplier = async (document: string) => {
        setSupplierLoading(true);
        try {
            const response = await axios.get(`/api/suppliers/external-search/${document}`);
            if (response.data) {
                // Si tiene id, es un proveedor existente
                if (response.data.id) {
                    handleSelectSupplier(response.data);
                    showSuccess('¡Proveedor encontrado!', `Se encontró: ${response.data.name}`);
                } else {
                    // Si no tiene id, crear el proveedor primero
                    const createResponse = await axios.post('/suppliers/quick-store', response.data);
                    if (createResponse.data.success) {
                        handleSelectSupplier(createResponse.data.supplier);
                        showSuccess('¡Proveedor creado!', `Se creó: ${createResponse.data.supplier.name}`);
                    }
                }
            }
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'No se pudo obtener la información');
        } finally {
            setSupplierLoading(false);
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
                sale_price: 0,
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

    const updateDetail = (index: number, field: 'quantity' | 'unit_price' | 'sale_price', value: string) => {
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

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="space-y-2">
                                    {!selectedSupplier ? (
                                        <div>
                                            <Label htmlFor="supplier-search">Proveedor *</Label>
                                            <div className="relative">
                                                <Input
                                                    ref={supplierSearchRef}
                                                    id="supplier-search"
                                                    placeholder="Buscar por nombre, DNI o RUC..."
                                                    value={supplierSearch}
                                                    onChange={(e) => setSupplierSearch(e.target.value)}
                                                    autoComplete="off"
                                                    className="pr-10"
                                                />
                                                {supplierLoading ? (
                                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                                                ) : (
                                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                )}

                                                {showSupplierDropdown && supplierResults.length > 0 && (
                                                    <div ref={supplierDropdownRef} className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-auto">
                                                        {supplierResults.map((supplier) => (
                                                            <button
                                                                key={supplier.id}
                                                                type="button"
                                                                onClick={() => handleSelectSupplier(supplier)}
                                                                className="w-full text-left px-3 py-2 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0"
                                                            >
                                                                <p className="font-medium text-sm">{supplier.name}</p>
                                                                <p className="text-xs text-muted-foreground">{supplier.document_type}: {supplier.document_number}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {showSupplierDropdown && supplierSearch.length >= 2 && supplierResults.length === 0 && !supplierLoading && (
                                                    <div ref={supplierDropdownRef} className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3">
                                                        <p className="text-sm text-muted-foreground mb-2">No se encontró el proveedor</p>
                                                        {(supplierSearch.length === 8 || supplierSearch.length === 11) && /^\d+$/.test(supplierSearch) ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => handleQuickExternalSearchSupplier(supplierSearch)}
                                                            >
                                                                <Search className="h-4 w-4 mr-2" />
                                                                Buscar en {supplierSearch.length === 8 ? 'RENIEC' : 'SUNAT'}
                                                            </Button>
                                                        ) : (
                                                            <p className="text-xs text-amber-600">Ingresa DNI (8) o RUC (11 dígitos)</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Escribe mínimo 2 caracteres</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Label>Proveedor *</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 border rounded-lg px-3 py-2 bg-muted/50">
                                                    <p className="text-sm font-semibold">{selectedSupplier.document_type}: {selectedSupplier.document_number} - {selectedSupplier.name}</p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={handleClearSupplier}>Cambiar</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order_date">Fecha de Orden *</Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => handleChange('order_date', e.target.value)}
                                        className={errors.order_date ? 'border-red-500' : ''}
                                    />
                                    {errors.order_date && (
                                        <p className="text-sm text-red-500">{errors.order_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expected_date">Fecha Esperada</Label>
                                    <Input
                                        id="expected_date"
                                        type="date"
                                        value={formData.expected_date}
                                        onChange={(e) => handleChange('expected_date', e.target.value)}
                                        className={errors.expected_date ? 'border-red-500' : ''}
                                    />
                                    {errors.expected_date && (
                                        <p className="text-sm text-red-500">{errors.expected_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
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
                                        <p className="text-sm text-red-500">{errors.discount}</p>
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
                                                            {product.category.name} • {product.brand.name}
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
                                                <TableHead className="w-28">Cantidad</TableHead>
                                                <TableHead className="w-32">P. Compra</TableHead>
                                                <TableHead className="w-32">P. Venta</TableHead>
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
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={detail.sale_price}
                                                            onChange={(e) => updateDetail(index, 'sale_price', e.target.value)}
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