import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Printer, Download, FileText, ArrowRight } from 'lucide-react';

interface SaleSuccessModalProps {
    open: boolean;
    saleId: number;
    saleNumber: string;
    total: number;
    onClose: () => void;
}

export default function SaleSuccessModal({ open, saleId, saleNumber, total, onClose }: SaleSuccessModalProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const handlePrint = (size: string) => {
        window.open(`/sales/${saleId}/pdf?size=${size}&action=print`, '_blank');
    };

    const handleDownload = (size: string) => {
        window.open(`/sales/${saleId}/pdf?size=${size}&action=download`, '_blank');
    };

    const handleViewDetails = () => {
        window.location.href = `/sales/${saleId}`;
    };

    const handleNewSale = () => {
        window.location.href = '/sales/create';
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        ¡Venta Registrada Exitosamente!
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Info de la venta */}
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Número de Venta:</span>
                            <span className="font-mono font-semibold">{saleNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total:</span>
                            <span className="font-semibold text-lg text-green-600">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Opciones de impresión */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Selecciona una opción:</p>

                        {/* Imprimir */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrint('a4')}
                                className="justify-start"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir A4
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrint('80mm')}
                                className="justify-start"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir 80mm
                            </Button>
                        </div>

                        {/* Descargar */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload('a4')}
                                className="justify-start"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar A4
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload('80mm')}
                                className="justify-start"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar 80mm
                            </Button>
                        </div>
                    </div>

                    <div className="pt-2 border-t space-y-2">
                        {/* Ver detalles */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleViewDetails}
                            className="w-full justify-start"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Detalles de la Venta
                        </Button>

                        {/* Nueva venta */}
                        <Button
                            onClick={handleNewSale}
                            className="w-full"
                        >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Nueva Venta
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
