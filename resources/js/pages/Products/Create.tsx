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
import { ArrowLeft } from 'lucide-react';
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

interface ProductsCreateProps {
    categories: Category[];
    brands: Brand[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
    { title: 'Crear Producto', href: '/products/create' },
];

export default function ProductsCreate({ categories, brands }: ProductsCreateProps) {
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
        min_stock: '',
        max_stock: '',
        igv_percentage: '18.00',
        price_includes_igv: true,
        weight: '',
        dimensions: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.post('/products', formData, {
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
                                    <Label htmlFor="brand_id">Marca *</Label>
                                    <Select value={formData.brand_id} onValueChange={(value) => handleChange('brand_id', value)}>
                                        <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Seleccionar marca" />
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

                                <div className="grid grid-cols-2 gap-4">
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