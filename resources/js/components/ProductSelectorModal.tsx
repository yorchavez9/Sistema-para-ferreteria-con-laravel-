import { useState, useMemo } from 'react';
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
import { Search, Plus, Package } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string;
    sale_price: number;
    purchase_price?: number;
    total_stock?: number;
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
    products: Product[];
    onAddProduct: (productId: number) => void;
}

export default function ProductSelectorModal({
    open,
    onClose,
    products,
    onAddProduct,
}: ProductSelectorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        const search = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category?.name.toLowerCase().includes(search) ||
            product.brand?.name.toLowerCase().includes(search)
        );
    }, [products, searchTerm]);

    const handleAddProduct = (productId: number) => {
        onAddProduct(productId);
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
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
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
                                            <span className={`font-semibold ${product.total_stock && product.total_stock > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                {product.total_stock || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => handleAddProduct(product.id)}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Agregar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
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