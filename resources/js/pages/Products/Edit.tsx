import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
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
    igv_percentage: number;
    price_includes_igv: boolean;
    min_stock: number;
    max_stock: number;
    description: string | null;
    technical_specifications: string | null;
    image: string | null;
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
    const [data, setData] = useState({
        name: product.name,
        code: product.code,
        barcode: product.barcode || '',
        category_id: product.category_id.toString(),
        brand_id: product.brand_id.toString(),
        unit_of_measure: product.unit_of_measure,
        purchase_price: product.purchase_price.toString(),
        sale_price: product.sale_price.toString(),
        igv_percentage: product.igv_percentage.toString(),
        price_includes_igv: product.price_includes_igv,
        min_stock: product.min_stock.toString(),
        max_stock: product.max_stock.toString(),
        description: product.description || '',
        technical_specifications: product.technical_specifications || '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        product.image ? `/storage/${product.image}` : null
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showError('Archivo inválido', 'Por favor selecciona una imagen válida.');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showError('Archivo muy grande', 'La imagen no debe superar los 2MB.');
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.keys(data).forEach((key) => {
            formData.append(key, (data as any)[key]);
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        router.post(`/products/${product.id}`, formData, {
            onSuccess: () => {
                showSuccess('¡Producto actualizado!', 'El producto ha sido actualizado exitosamente.');
            },
            onError: (errors) => {
                setErrors(errors);
                showError('Error al actualizar', 'Por favor, revisa los campos y vuelve a intentar.');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    const handleChange = (field: string, value: string | boolean) => {
        setData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
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
                                        onChange={(e) => handleChange('name', e.target.value)}
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
                                        onChange={(e) => handleChange('code', e.target.value)}
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
                                        onChange={(e) => handleChange('barcode', e.target.value)}
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
                                        onValueChange={(value) => handleChange('category_id', value)}
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
                                        onValueChange={(value) => handleChange('brand_id', value)}
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
                                        onChange={(e) => handleChange('unit_of_measure', e.target.value)}
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
                                        onChange={(e) => handleChange('purchase_price', e.target.value)}
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
                                        onChange={(e) => handleChange('sale_price', e.target.value)}
                                        className={errors.sale_price ? 'border-red-500' : ''}
                                    />
                                    {errors.sale_price && (
                                        <p className="text-sm text-red-500">{errors.sale_price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="igv_percentage">Porcentaje de IGV (%) *</Label>
                                    <Input
                                        id="igv_percentage"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.igv_percentage}
                                        onChange={(e) => handleChange('igv_percentage', e.target.value)}
                                        className={errors.igv_percentage ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Ingrese 0 para productos sin IGV, 18 para IGV estándar, o el porcentaje que corresponda
                                    </p>
                                    {errors.igv_percentage && (
                                        <p className="text-sm text-red-500">{errors.igv_percentage}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 border rounded-lg p-4 bg-muted/50">
                                    <Checkbox
                                        id="price_includes_igv"
                                        checked={data.price_includes_igv}
                                        onCheckedChange={(checked) => handleChange('price_includes_igv', !!checked)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="price_includes_igv"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            El precio de venta incluye IGV
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Si está marcado, el sistema calculará el precio base separando el IGV del precio final
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_stock">Stock Mínimo *</Label>
                                    <Input
                                        id="min_stock"
                                        type="number"
                                        min="0"
                                        value={data.min_stock}
                                        onChange={(e) => handleChange('min_stock', e.target.value)}
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
                                        onChange={(e) => handleChange('max_stock', e.target.value)}
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
                                    onChange={(e) => handleChange('description', e.target.value)}
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
                                    onChange={(e) => handleChange('technical_specifications', e.target.value)}
                                    rows={4}
                                    className={errors.technical_specifications ? 'border-red-500' : ''}
                                />
                                {errors.technical_specifications && (
                                    <p className="text-sm text-red-500">{errors.technical_specifications}</p>
                                )}
                            </div>

                            {/* Campo de Imagen */}
                            <div className="space-y-2">
                                <Label htmlFor="image">Imagen del Producto</Label>
                                <div className="mt-2">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-40 w-40 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full"
                                                onClick={handleRemoveImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="image"
                                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold">Click para subir</span> o arrastra una imagen
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    PNG, JPG, WEBP (máx. 2MB)
                                                </p>
                                            </div>
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="text-sm text-red-500 mt-1">{errors.image}</p>
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