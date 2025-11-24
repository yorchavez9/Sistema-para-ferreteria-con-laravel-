import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle,
    AlertTriangle,
    Info,
    X,
} from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface ProductImportModalProps {
    open: boolean;
    onClose: () => void;
}

interface ImportStats {
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
}

export default function ProductImportModal({ open, onClose }: ProductImportModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [importComplete, setImportComplete] = useState(false);
    const [importStats, setImportStats] = useState<ImportStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar que sea un archivo Excel
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];

            if (!validTypes.includes(file.type)) {
                setError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
                setSelectedFile(null);
                return;
            }

            // Validar tamaño (máximo 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('El archivo es demasiado grande. Tamaño máximo: 10MB');
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            setError(null);
            setImportComplete(false);
            setImportStats(null);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/products/template';
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setImporting(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setImportStats(response.data.stats);
                setImportComplete(true);

                // Recargar la página de productos después de un breve delay
                setTimeout(() => {
                    router.reload({ only: ['products', 'stats'] });
                }, 2000);
            } else {
                setError(response.data.message || 'Error durante la importación');
            }
        } catch (err: any) {
            console.error('Error importing products:', err);
            setError(
                err.response?.data?.message ||
                'Error al importar el archivo. Por favor, verifica el formato.'
            );
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        if (!importing) {
            setSelectedFile(null);
            setError(null);
            setImportComplete(false);
            setImportStats(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onClose();
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setError(null);
        setImportComplete(false);
        setImportStats(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="!max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Importar Productos desde Excel
                    </DialogTitle>
                    <DialogDescription>
                        Importa múltiples productos desde un archivo Excel
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Instrucciones */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Instrucciones:</strong>
                            <ol className="list-decimal ml-4 mt-2 space-y-1">
                                <li>Descarga la plantilla de Excel haciendo clic en el botón de abajo</li>
                                <li>Completa la plantilla con los datos de tus productos</li>
                                <li>
                                    Campos requeridos: Nombre, Código, Categoría, Precio Compra, Precio Venta
                                </li>
                                <li>Si la categoría o marca no existe, se creará automáticamente</li>
                                <li>Los productos existentes con el mismo código serán actualizados</li>
                            </ol>
                        </AlertDescription>
                    </Alert>

                    {/* Botón de descarga de plantilla */}
                    <div className="flex justify-center">
                        <Button
                            onClick={handleDownloadTemplate}
                            variant="outline"
                            className="w-full"
                            disabled={importing}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Plantilla de Excel
                        </Button>
                    </div>

                    {/* Selección de archivo */}
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Seleccionar Archivo Excel</Label>
                        <div className="flex gap-2">
                            <input
                                id="file-upload"
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                disabled={importing}
                                className="hidden"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="flex-1"
                                disabled={importing}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {selectedFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                            </Button>
                        </div>

                        {/* Archivo seleccionado */}
                        {selectedFile && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </span>
                                </div>
                                {!importing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Progreso de importación */}
                    {importing && (
                        <div className="space-y-2">
                            <Alert className="bg-blue-50 border-blue-200">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription>
                                    <strong className="text-blue-800">Importando productos...</strong>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Por favor espera mientras se procesan los productos
                                    </p>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Resultados de importación */}
                    {importComplete && importStats && (
                        <div className="space-y-3">
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>
                                    <strong className="text-green-800">Importación completada</strong>
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Importados</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {importStats.imported}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Actualizados</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {importStats.updated}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Omitidos</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {importStats.skipped}
                                    </p>
                                </div>
                            </div>

                            {/* Errores */}
                            {importStats.errors.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Errores encontrados:</strong>
                                        <ul className="list-disc ml-4 mt-2 space-y-1 text-xs max-h-40 overflow-y-auto">
                                            {importStats.errors.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2">
                        {!importComplete && (
                            <>
                                <Button
                                    onClick={handleImport}
                                    disabled={!selectedFile || importing}
                                    className="flex-1"
                                >
                                    {importing ? (
                                        <>Importando...</>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Importar Productos
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={handleClose} disabled={importing}>
                                    Cancelar
                                </Button>
                            </>
                        )}

                        {importComplete && (
                            <Button onClick={handleClose} className="w-full">
                                Cerrar
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
