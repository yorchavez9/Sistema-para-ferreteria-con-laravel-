import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
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
import {
    Plus,
    Trash2,
    Search,
    Calculator,
    Save
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    code: string;
    sale_price: number;
    unit_of_measure: string;
    total_stock: number;
    category?: { name: string };
    brand?: { name: string };
}

interface Customer {
    id: number;
    name: string;
    document_number: string;
    document_type: string;
}

interface Branch {
    id: number;
    name: string;
}

interface QuoteDetail {
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface QuoteCreateProps {
    defaultBranchId: number;
    customers: Customer[];
    branches: Branch[];
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cotizaciones', href: '/quotes' },
    { title: 'Nueva Cotización', href: '/quotes/create' },
];

export default function QuoteCreate({ defaultBranchId, customers, branches, products }: QuoteCreateProps) {
    const [formData, setFormData] = useState({
        customer_id: '',
        branch_id: defaultBranchId.toString(),
        quote_date: new Date().toISOString().split('T')[0],
        expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        discount: 0,
        notes: '',
    });

    const [details, setDetails] = useState<QuoteDetail[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Filtrar productos por búsqueda
    useEffect(() => {
        if (productSearch.trim() === '') {
            setFilteredProducts(products);
        } else {
            const search = productSearch.toLowerCase();
            setFilteredProducts(
                products.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.code.toLowerCase().includes(search)
                )
            );
        }
    }, [productSearch, products]);

    const addProduct = () => {
        if (!selectedProduct) return;

        const product = products.find(p => p.id.toString() === selectedProduct);
        if (!product) return;

        // Verificar si ya está en la lista
        const existingIndex = details.findIndex(d => d.product_id === product.id);
        if (existingIndex >= 0) {
            // Incrementar cantidad
            const newDetails = [...details];
            newDetails[existingIndex].quantity += 1;
            newDetails[existingIndex].subtotal = newDetails[existingIndex].quantity * newDetails[existingIndex].unit_price;
            setDetails(newDetails);
        } else {
            // Agregar nuevo
            setDetails([...details, {
                product_id: product.id,
                product: product,
                quantity: 1,
                unit_price: product.sale_price,
                subtotal: product.sale_price,
            }]);
        }

        setSelectedProduct('');
        setProductSearch('');
    };

    const removeProduct = (index: number) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity < 1) return;
        const newDetails = [...details];
        newDetails[index].quantity = quantity;
        newDetails[index].subtotal = quantity * newDetails[index].unit_price;
        setDetails(newDetails);
    };

    const updatePrice = (index: number, price: number) => {
        if (price < 0) return;
        const newDetails = [...details];
        newDetails[index].unit_price = price;
        newDetails[index].subtotal = newDetails[index].quantity * price;
        setDetails(newDetails);
    };

    const calculateSubtotal = () => {
        return details.reduce((sum, detail) => sum + detail.subtotal, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - formData.discount;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (details.length === 0) {
            setErrors({ details: 'Debe agregar al menos un producto' });
            return;
        }

        router.post('/quotes', {
            ...formData,
            details: details.map(d => ({
                product_id: d.product_id,
                quantity: d.quantity,
                unit_price: d.unit_price,
            })),
        }, {
            onError: (errors) => {
                setErrors(errors);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Cotización" />

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="customer_id">Cliente (Opcional)</Label>
                                    <Select
                                        value={formData.customer_id || "none"}
                                        onValueChange={(value) => setFormData({ ...formData, customer_id: value === "none" ? "" : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin cliente</SelectItem>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.name} - {customer.document_number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="branch_id">Sucursal *</Label>
                                    <Select
                                        value={formData.branch_id}
                                        onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="quote_date">Fecha de Cotización *</Label>
                                    <Input
                                        type="date"
                                        id="quote_date"
                                        value={formData.quote_date}
                                        onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="expiration_date">Fecha de Vencimiento *</Label>
                                    <Input
                                        type="date"
                                        id="expiration_date"
                                        value={formData.expiration_date}
                                        onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                                        required
                                        min={formData.quote_date}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="notes">Notas / Observaciones</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Condiciones, términos especiales, etc."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Productos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Buscador de productos */}
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Buscar producto por nombre o código..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger className="w-[400px]">
                                        <SelectValue placeholder="Seleccionar producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredProducts.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                {product.code} - {product.name} ({formatCurrency(product.sale_price)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" onClick={addProduct} disabled={!selectedProduct}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar
                                </Button>
                            </div>

                            {errors.details && (
                                <p className="text-sm text-destructive">{errors.details}</p>
                            )}

                            {/* Tabla de productos */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="w-32">Cantidad</TableHead>
                                            <TableHead className="w-40">Precio Unit.</TableHead>
                                            <TableHead className="w-40">Subtotal</TableHead>
                                            <TableHead className="w-20"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {details.length > 0 ? (
                                            details.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{detail.product?.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {detail.product?.code}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={detail.quantity}
                                                            onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={detail.unit_price}
                                                            onChange={(e) => updatePrice(index, parseFloat(e.target.value))}
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(detail.subtotal)}
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
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                    No hay productos agregados
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Totales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Subtotal:</span>
                                    <span className="text-lg font-semibold">{formatCurrency(calculateSubtotal())}</span>
                                </div>

                                <div className="flex justify-between items-center gap-4">
                                    <Label htmlFor="discount">Descuento:</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            id="discount"
                                            min="0"
                                            step="0.01"
                                            value={formData.discount}
                                            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                            className="w-32"
                                        />
                                        <span className="text-lg font-semibold">{formatCurrency(formData.discount)}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold">TOTAL:</span>
                                        <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/quotes')}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={details.length === 0}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cotización
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
