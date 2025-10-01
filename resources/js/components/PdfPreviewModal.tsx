import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, ArrowLeft, Printer, Check, File, FileStack, Receipt, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfPreviewModalProps {
    open: boolean;
    onClose: () => void;
    documentId: number;
    documentNumber: string;
    documentType: 'purchase-order' | 'sale' | 'payment';
    documentLabel?: string;
}

export default function PdfPreviewModal({
    open,
    onClose,
    documentId,
    documentNumber,
    documentType,
    documentLabel = 'Documento'
}: PdfPreviewModalProps) {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [showingPreview, setShowingPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');

    // Resetear estado cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            setSelectedSize('');
            setShowingPreview(false);
            setPdfUrl('');
        }
    }, [open]);

    // Obtener la ruta base según el tipo de documento
    const getBasePath = () => {
        if (documentType === 'purchase-order') return 'purchase-orders';
        if (documentType === 'payment') return 'payments';
        return 'sales';
    };

    const sizes = [
        {
            value: 'a4',
            label: 'A4',
            dimension: '210mm x 297mm',
            description: 'Tamaño carta estándar',
            Icon: File
        },
        {
            value: 'a5',
            label: 'A5',
            dimension: '148mm x 210mm',
            description: 'Media carta',
            Icon: FileStack
        },
        {
            value: '80mm',
            label: '80mm',
            dimension: 'Ticket',
            description: 'Impresora térmica 80mm',
            Icon: Receipt
        },
        {
            value: '50mm',
            label: '50mm',
            dimension: 'Ticket pequeño',
            description: 'Impresora térmica 50mm',
            Icon: Ticket
        },
    ];

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        const basePath = getBasePath();
        const endpoint = documentType === 'payment' ? 'voucher' : 'pdf';
        const url = `/${basePath}/${documentId}/${endpoint}?size=${size}&preview=true`;
        setPdfUrl(url);
        setShowingPreview(true);
    };

    const handleBackToSelection = () => {
        setShowingPreview(false);
        setPdfUrl('');
    };

    const handleDownload = () => {
        const basePath = getBasePath();
        const endpoint = documentType === 'payment' ? 'voucher' : 'pdf';
        const url = `/${basePath}/${documentId}/${endpoint}?size=${selectedSize}`;
        window.location.href = url;
    };

    const handlePrint = () => {
        // Imprimir el iframe
        const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    };

    // Determinar el ancho del modal según el tamaño seleccionado
    const getModalWidth = () => {
        if (!showingPreview) return "sm:max-w-[500px]";

        switch (selectedSize) {
            case '50mm':
                return "sm:max-w-[400px]"; // Modal más pequeño para 50mm
            case '80mm':
                return "sm:max-w-[500px]"; // Modal pequeño para 80mm
            case 'a5':
                return "sm:max-w-[750px]"; // Modal mediano-grande para A5
            case 'a4':
            default:
                return "sm:max-w-[850px]"; // Modal grande para A4
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={getModalWidth()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {showingPreview && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBackToSelection}
                                className="mr-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <FileText className="h-5 w-5" />
                        {showingPreview ? 'Vista Previa del PDF' : 'Imprimir / Descargar PDF'}
                    </DialogTitle>
                    <DialogDescription>
                        {documentLabel}: <span className="font-semibold">{documentNumber}</span>
                        {showingPreview && (
                            <span className="ml-2 text-xs">
                                • Tamaño: {sizes.find(s => s.value === selectedSize)?.label}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {!showingPreview ? (
                    // Vista de selección de tamaño
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Selecciona el formato del documento
                        </p>

                        {/* Grid de tarjetas con opciones */}
                        <div className="grid grid-cols-2 gap-3">
                            {sizes.map((size) => {
                                const IconComponent = size.Icon;
                                return (
                                    <button
                                        key={size.value}
                                        onClick={() => handleSizeSelect(size.value)}
                                        className={cn(
                                            "relative p-4 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary hover:shadow-md",
                                            selectedSize === size.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-background"
                                        )}
                                    >
                                        {/* Check icon */}
                                        {selectedSize === size.value && (
                                            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                        )}

                                        {/* Icono de Lucide */}
                                        <div className="mb-3">
                                            <IconComponent className="h-10 w-10 text-primary" strokeWidth={1.5} />
                                        </div>

                                        {/* Título */}
                                        <h3 className="font-semibold text-lg mb-1">
                                            {size.label}
                                        </h3>

                                        {/* Dimensiones */}
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            {size.dimension}
                                        </p>

                                        {/* Descripción */}
                                        <p className="text-xs text-muted-foreground">
                                            {size.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Haz clic en un formato para ver la vista previa
                        </p>
                    </div>
                ) : (
                    // Vista previa del PDF
                    <div className="space-y-4">
                        {/* Iframe con el PDF */}
                        <div className="border rounded-lg overflow-hidden" style={{
                            height: selectedSize === '50mm' || selectedSize === '80mm' ? '60vh' : '65vh'
                        }}>
                            <iframe
                                id="pdf-preview-iframe"
                                src={pdfUrl}
                                className="w-full h-full"
                                title="Vista previa del PDF"
                            />
                        </div>

                        {/* Botones de acción en vista previa */}
                        <div className="flex gap-2 justify-end">
                            <Button
                                onClick={handlePrint}
                                variant="default"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>

                            <Button
                                onClick={handleDownload}
                                variant="outline"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                            </Button>

                            <Button
                                onClick={onClose}
                                variant="ghost"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}