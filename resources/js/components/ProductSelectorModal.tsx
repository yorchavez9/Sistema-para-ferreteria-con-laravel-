import { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, Plus, Package, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    code: string;
    sale_price: number;
    purchase_price?: number;
    stock?: number;
    total_stock?: number;
    unit?: string;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
}

interface ProductSelectorModalProps {
    open: boolean;
    onClose: () => void;
    products?: Product[];
    onAddProduct?: (productId: number) => void;
    onSelectProduct?: (product: Product) => void;
    branchId?: number;
}

export default function ProductSelectorModal({
    open,
    onClose,
    products: propProducts,
    onAddProduct,
    onSelectProduct,
    branchId,
}: ProductSelectorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>(propProducts || []);
    const [loading, setLoading] = useState(false);

    // Si se pasa branchId, cargar productos desde API
    useEffect(() => {
        if (branchId && open) {
            const loadProducts = async () => {
                setLoading(true);
                try {
                    const response = await axios.get('/api/products/search', {
                        params: {
                            branch_id: branchId,
                            search: '',
                        }
                    });
                    setProducts(response.data.products || []);
                } catch (error) {
                    console.error('Error loading products:', error);
                    setProducts([]);
                } finally {
                    setLoading(false);
                }
            };
            loadProducts();
        } else if (propProducts) {
            setProducts(propProducts);
        }
    }, [branchId, open, propProducts]);

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (!searchTerm.trim()) return products;
        const search = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category?.name.toLowerCase().includes(search) ||
            product.brand?.name.toLowerCase().includes(search)
        );
    }, [products, searchTerm]);

    const handleAddProduct = (product: Product) => {
        if (onSelectProduct) {
            onSelectProduct(product);
        } else if (onAddProduct) {
            onAddProduct(product.id);
        }
        handleClose();
    };

    const handleClose = () => {
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="!w-[75vw] !max-w-[75vw] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Seleccionar Productos
                    </DialogTitle>
                    <DialogDescription>
                        Busca y agrega productos a tu orden de compra
                    </DialogDescription>
                </DialogHeader>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, código, categoría o marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                        autoFocus
                    />
                </div>

                {/* Products Table */}
                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right">Precio Venta</TableHead>
                                <TableHead className="text-center">Stock</TableHead>
                                <TableHead className="w-32 text-center">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-10 w-10 opacity-50 animate-spin" />
                                            <p>Cargando productos...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => {
                                    const stock = product.stock || product.total_stock || 0;
                                    return (
                                        <TableRow key={product.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <span className="font-mono font-semibold text-primary">
                                                    {product.code}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                {product.category?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {product.brand?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-semibold text-lg text-green-600">
                                                    S/ {Number(product.sale_price || 0).toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-semibold ${stock > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                    {stock}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => handleAddProduct(product)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Agregar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Package className="h-10 w-10 opacity-50" />
                                            <p>No se encontraron productos</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        {filteredProducts.length} productos encontrados
                    </p>
                    <Button variant="outline" onClick={handleClose}>
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}