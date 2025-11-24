import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Category {
    id: number;
    name: string;
    code: string;
}

interface Brand {
    id: number;
    name: string;
    code: string;
}

interface Branch {
    id: number;
    name: string;
}

interface ProductsCreateProps {
    categories: Category[];
    brands: Brand[];
    branches: Branch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
    { title: 'Crear Producto', href: '/products/create' },
];

export default function ProductsCreate({ categories, brands, branches }: ProductsCreateProps) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        barcode: '',
        description: '',
        technical_specifications: '',
        category_id: '',
        brand_id: '',
        unit_of_measure: 'UND',
        purchase_price: '',
        sale_price: '',
        wholesale_price: '',
        retail_price: '',
        min_stock: '',
        max_stock: '',
        igv_percentage: '18.00',
        price_includes_igv: true,
        weight: '',
        dimensions: '',
        initial_stock: '',
        branch_id: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showError('Archivo inválido', 'Por favor selecciona una imagen válida.');
                return;
            }

            // Validar tamaño (máx 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showError('Archivo muy grande', 'La imagen no debe superar los 2MB.');
                return;
            }

            setImageFile(file);

            // Crear preview
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
        setLoading(true);
        setErrors({});

        // Crear FormData para enviar archivo
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, (formData as any)[key]);
        });

        if (imageFile) {
            data.append('image', imageFile);
        }

        router.post('/products', data, {
            onSuccess: () => {
                showSuccess('¡Producto creado!', 'El producto ha sido creado exitosamente.');
            },
            onError: (errors) => {
                setErrors(errors);
                showError('Error al crear producto', 'Por favor, revisa los campos y vuelve a intentar.');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Crear Producto</h1>
                        <p className="text-muted-foreground">
                            Agrega un nuevo producto al catálogo
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Información Básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Básica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nombre del Producto *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Ej: Taladro Percutor 13mm"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="code">Código *</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => handleChange('code', e.target.value)}
                                            placeholder="P001"
                                            className={errors.code ? 'border-red-500' : ''}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-red-500 mt-1">{errors.code}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="barcode">Código de Barras</Label>
                                        <Input
                                            id="barcode"
                                            value={formData.barcode}
                                            onChange={(e) => handleChange('barcode', e.target.value)}
                                            placeholder="7894561230001"
                                            className={errors.barcode ? 'border-red-500' : ''}
                                        />
                                        {errors.barcode && (
                                            <p className="text-sm text-red-500 mt-1">{errors.barcode}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Descripción del producto..."
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="technical_specifications">Especificaciones Técnicas</Label>
                                    <Textarea
                                        id="technical_specifications"
                                        value={formData.technical_specifications}
                                        onChange={(e) => handleChange('technical_specifications', e.target.value)}
                                        placeholder="Especificaciones técnicas detalladas..."
                                        className={errors.technical_specifications ? 'border-red-500' : ''}
                                    />
                                    {errors.technical_specifications && (
                                        <p className="text-sm text-red-500 mt-1">{errors.technical_specifications}</p>
                                    )}
                                </div>

                                {/* Campo de Imagen */}
                                <div>
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
                            </CardContent>
                        </Card>

                        {/* Clasificación */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Clasificación y Precios</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="category_id">Categoría *</Label>
                                    <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                                        <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccionar categoría" />
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
                                        <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="brand_id">Marca</Label>
                                    <Select value={formData.brand_id || 'none'} onValueChange={(value) => handleChange('brand_id', value === 'none' ? '' : value)}>
                                        <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccionar marca (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin marca</SelectItem>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.brand_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.brand_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="unit_of_measure">Unidad de Medida *</Label>
                                    <Select value={formData.unit_of_measure} onValueChange={(value) => handleChange('unit_of_measure', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UND">Unidad</SelectItem>
                                            <SelectItem value="KG">Kilogramo</SelectItem>
                                            <SelectItem value="MTR">Metro</SelectItem>
                                            <SelectItem value="LT">Litro</SelectItem>
                                            <SelectItem value="M2">Metro²</SelectItem>
                                            <SelectItem value="M3">Metro³</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="purchase_price">Precio Compra *</Label>
                                    <Input
                                        id="purchase_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.purchase_price}
                                        onChange={(e) => handleChange('purchase_price', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.purchase_price ? 'border-red-500' : ''}
                                    />
                                    {errors.purchase_price && (
                                        <p className="text-sm text-red-500 mt-1">{errors.purchase_price}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="sale_price">Precio Venta *</Label>
                                    <Input
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.sale_price}
                                        onChange={(e) => handleChange('sale_price', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.sale_price ? 'border-red-500' : ''}
                                    />
                                    {errors.sale_price && (
                                        <p className="text-sm text-red-500 mt-1">{errors.sale_price}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="wholesale_price">Precio al por Mayor</Label>
                                        <Input
                                            id="wholesale_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.wholesale_price}
                                            onChange={(e) => handleChange('wholesale_price', e.target.value)}
                                            placeholder="0.00"
                                            className={errors.wholesale_price ? 'border-red-500' : ''}
                                        />
                                        {errors.wholesale_price && (
                                            <p className="text-sm text-red-500 mt-1">{errors.wholesale_price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="retail_price">Precio al por Menor</Label>
                                        <Input
                                            id="retail_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.retail_price}
                                            onChange={(e) => handleChange('retail_price', e.target.value)}
                                            placeholder="0.00"
                                            className={errors.retail_price ? 'border-red-500' : ''}
                                        />
                                        {errors.retail_price && (
                                            <p className="text-sm text-red-500 mt-1">{errors.retail_price}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="igv_percentage">Porcentaje de IGV (%) *</Label>
                                    <Input
                                        id="igv_percentage"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.igv_percentage}
                                        onChange={(e) => handleChange('igv_percentage', e.target.value)}
                                        placeholder="18.00"
                                        className={errors.igv_percentage ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Ingrese 0 para productos sin IGV, 18 para IGV estándar, o el porcentaje que corresponda
                                    </p>
                                    {errors.igv_percentage && (
                                        <p className="text-sm text-red-500 mt-1">{errors.igv_percentage}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 border rounded-lg p-4 bg-muted/50">
                                    <Checkbox
                                        id="price_includes_igv"
                                        checked={formData.price_includes_igv}
                                        onCheckedChange={(checked) => handleChange('price_includes_igv', checked ? 'true' : 'false')}
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="min_stock">Stock Mínimo *</Label>
                                        <Input
                                            id="min_stock"
                                            type="number"
                                            min="0"
                                            value={formData.min_stock}
                                            onChange={(e) => handleChange('min_stock', e.target.value)}
                                            placeholder="0"
                                            className={errors.min_stock ? 'border-red-500' : ''}
                                        />
                                        {errors.min_stock && (
                                            <p className="text-sm text-red-500 mt-1">{errors.min_stock}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="max_stock">Stock Máximo *</Label>
                                        <Input
                                            id="max_stock"
                                            type="number"
                                            min="0"
                                            value={formData.max_stock}
                                            onChange={(e) => handleChange('max_stock', e.target.value)}
                                            placeholder="0"
                                            className={errors.max_stock ? 'border-red-500' : ''}
                                        />
                                        {errors.max_stock && (
                                            <p className="text-sm text-red-500 mt-1">{errors.max_stock}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="branch_id">Sucursal para Stock Inicial</Label>
                                    <Select value={formData.branch_id || 'none'} onValueChange={(value) => handleChange('branch_id', value === 'none' ? '' : value)}>
                                        <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccionar sucursal (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No agregar stock inicial</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Selecciona una sucursal si deseas agregar stock inicial al producto
                                    </p>
                                    {errors.branch_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.branch_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="initial_stock">Stock Inicial</Label>
                                    <Input
                                        id="initial_stock"
                                        type="number"
                                        min="0"
                                        value={formData.initial_stock}
                                        onChange={(e) => handleChange('initial_stock', e.target.value)}
                                        placeholder="0"
                                        disabled={!formData.branch_id}
                                        className={errors.initial_stock ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Cantidad inicial de productos en el inventario
                                    </p>
                                    {errors.initial_stock && (
                                        <p className="text-sm text-red-500 mt-1">{errors.initial_stock}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="weight">Peso (kg)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.weight}
                                            onChange={(e) => handleChange('weight', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="dimensions">Dimensiones</Label>
                                        <Input
                                            id="dimensions"
                                            value={formData.dimensions}
                                            onChange={(e) => handleChange('dimensions', e.target.value)}
                                            placeholder="30x20x10 cm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Producto'}
                        </Button>
                        <Link href="/products">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}