import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Product {
    id: number;
    name: string;
    code: string;
    barcode: string | null;
    category_id: number;
    brand_id: number;
    unit_of_measure: string;
    purchase_price: number;
    sale_price: number;
    min_stock: number;
    max_stock: number;
    description: string | null;
    technical_specifications: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Props {
    product: Product;
    categories: Category[];
    brands: Brand[];
}

export default function Edit({ product, categories, brands }: Props) {
    const { data, setData, put, errors, processing } = useForm({
        name: product.name,
        code: product.code,
        barcode: product.barcode || '',
        category_id: product.category_id,
        brand_id: product.brand_id,
        unit_of_measure: product.unit_of_measure,
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
        description: product.description || '',
        technical_specifications: product.technical_specifications || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/products/${product.id}`, {
            onSuccess: () => {
                showSuccess('¡Producto actualizado!', 'El producto ha sido actualizado exitosamente.');
            },
            onError: () => {
                showError('Error al actualizar', 'No se pudo actualizar el producto.');
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: product.name, href: `/products/${product.id}` },
        { title: 'Editar', href: `/products/${product.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Producto" />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/products">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Producto</h1>
                        <p className="text-muted-foreground">
                            Actualiza la información del producto
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Código *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className={errors.code ? 'border-red-500' : ''}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Código de Barras</Label>
                                    <Input
                                        id="barcode"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        className={errors.barcode ? 'border-red-500' : ''}
                                    />
                                    {errors.barcode && (
                                        <p className="text-sm text-red-500">{errors.barcode}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Categoría *</Label>
                                    <Select
                                        value={data.category_id.toString()}
                                        onValueChange={(value) => setData('category_id', parseInt(value))}
                                    >
                                        <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-red-500">{errors.category_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand_id">Marca *</Label>
                                    <Select
                                        value={data.brand_id.toString()}
                                        onValueChange={(value) => setData('brand_id', parseInt(value))}
                                    >
                                        <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona una marca" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.brand_id && (
                                        <p className="text-sm text-red-500">{errors.brand_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_of_measure">Unidad de Medida *</Label>
                                    <Input
                                        id="unit_of_measure"
                                        value={data.unit_of_measure}
                                        onChange={(e) => setData('unit_of_measure', e.target.value)}
                                        placeholder="ej. Unidad, Caja, Metro"
                                        className={errors.unit_of_measure ? 'border-red-500' : ''}
                                    />
                                    {errors.unit_of_measure && (
                                        <p className="text-sm text-red-500">{errors.unit_of_measure}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purchase_price">Precio de Compra *</Label>
                                    <Input
                                        id="purchase_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', parseFloat(e.target.value))}
                                        className={errors.purchase_price ? 'border-red-500' : ''}
                                    />
                                    {errors.purchase_price && (
                                        <p className="text-sm text-red-500">{errors.purchase_price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sale_price">Precio de Venta *</Label>
                                    <Input
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', parseFloat(e.target.value))}
                                        className={errors.sale_price ? 'border-red-500' : ''}
                                    />
                                    {errors.sale_price && (
                                        <p className="text-sm text-red-500">{errors.sale_price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_stock">Stock Mínimo *</Label>
                                    <Input
                                        id="min_stock"
                                        type="number"
                                        min="0"
                                        value={data.min_stock}
                                        onChange={(e) => setData('min_stock', parseInt(e.target.value))}
                                        className={errors.min_stock ? 'border-red-500' : ''}
                                    />
                                    {errors.min_stock && (
                                        <p className="text-sm text-red-500">{errors.min_stock}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_stock">Stock Máximo *</Label>
                                    <Input
                                        id="max_stock"
                                        type="number"
                                        min="0"
                                        value={data.max_stock}
                                        onChange={(e) => setData('max_stock', parseInt(e.target.value))}
                                        className={errors.max_stock ? 'border-red-500' : ''}
                                    />
                                    {errors.max_stock && (
                                        <p className="text-sm text-red-500">{errors.max_stock}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="technical_specifications">Especificaciones Técnicas</Label>
                                <Textarea
                                    id="technical_specifications"
                                    value={data.technical_specifications}
                                    onChange={(e) => setData('technical_specifications', e.target.value)}
                                    rows={4}
                                    className={errors.technical_specifications ? 'border-red-500' : ''}
                                />
                                {errors.technical_specifications && (
                                    <p className="text-sm text-red-500">{errors.technical_specifications}</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Actualizar Producto'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/products">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}