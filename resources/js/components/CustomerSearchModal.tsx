import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, User, Plus, Check } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string;
    document_number: string;
    phone?: string;
    email?: string;
    address?: string;
}

interface CustomerSearchModalProps {
    open: boolean;
    onClose: () => void;
    onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerSearchModal({
    open,
    onClose,
    onSelectCustomer,
}: CustomerSearchModalProps) {
    const [searchDocument, setSearchDocument] = useState('');
    const [searching, setSearching] = useState(false);
    const [customerFound, setCustomerFound] = useState<Customer | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        document_type: 'DNI',
        document_number: '',
        phone: '',
        email: '',
        address: '',
    });

    const handleSearch = async () => {
        if (!searchDocument.trim()) return;

        setSearching(true);
        setCustomerFound(null);
        setShowCreateForm(false);

        try {
            // Consultar en la API externa (primero busca local, luego RENIEC/SUNAT)
            const response = await axios.post('/customers/consultar-documento', {
                document_number: searchDocument,
            });

            if (response.data.success) {
                if (response.data.found_in_db) {
                    // Cliente encontrado en la base de datos local
                    setCustomerFound(response.data.customer);
                } else {
                    // Datos obtenidos de API externa, preparar formulario con datos precargados
                    const apiData = response.data.api_data;
                    setShowCreateForm(true);
                    setNewCustomerData({
                        name: apiData.name || '',
                        document_type: apiData.document_type || (searchDocument.length === 8 ? 'DNI' :
                                                                 searchDocument.length === 11 ? 'RUC' : 'CE'),
                        document_number: apiData.document_number || searchDocument,
                        phone: '',
                        email: '',
                        address: apiData.direccion || '',
                    });
                }
            }
        } catch (error: any) {
            console.error('Error consultando documento:', error);
            // Si hay error, mostrar formulario vacío para crear manualmente
            setShowCreateForm(true);
            setNewCustomerData({
                ...newCustomerData,
                document_number: searchDocument,
                document_type: searchDocument.length === 8 ? 'DNI' :
                               searchDocument.length === 11 ? 'RUC' : 'CE',
            });
        } finally {
            setSearching(false);
        }
    };

    const handleCreateCustomer = async () => {
        setCreating(true);

        try {
            const response = await axios.post('/customers/quick-store', newCustomerData);

            if (response.data.success) {
                const newCustomer = response.data.customer;
                onSelectCustomer(newCustomer);
                handleCloseModal();
            }
        } catch (error: any) {
            console.error('Error creando cliente:', error);
            alert(error.response?.data?.message || 'Error al crear el cliente');
        } finally {
            setCreating(false);
        }
    };

    const handleSelectFoundCustomer = () => {
        if (customerFound) {
            onSelectCustomer(customerFound);
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setSearchDocument('');
        setCustomerFound(null);
        setShowCreateForm(false);
        setNewCustomerData({
            name: '',
            document_type: 'DNI',
            document_number: '',
            phone: '',
            email: '',
            address: '',
        });
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchDocument.trim()) {
            handleSearch();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleCloseModal}>
            <DialogContent className="!max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Buscar o Crear Cliente
                    </DialogTitle>
                    <DialogDescription>
                        Busca un cliente por DNI/RUC/CE o crea uno nuevo
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Búsqueda por Documento */}
                    <div className="space-y-2">
                        <Label htmlFor="search-document">Número de Documento (DNI/RUC/CE)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="search-document"
                                placeholder="Ingresa DNI, RUC o CE..."
                                value={searchDocument}
                                onChange={(e) => setSearchDocument(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={searching}
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={!searchDocument.trim() || searching}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                {searching ? 'Buscando...' : 'Buscar'}
                            </Button>
                        </div>
                    </div>

                    {/* Cliente Encontrado */}
                    {customerFound && (
                        <div className="border rounded-lg p-4 bg-green-50 space-y-3">
                            <div className="flex items-center gap-2 text-green-700 font-semibold">
                                <Check className="h-5 w-5" />
                                Cliente Encontrado en Base de Datos
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Código:</span>
                                    <p className="font-semibold font-mono">{customerFound.code}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        {customerFound.document_type === 'RUC' ? 'Razón Social:' : 'Nombre:'}
                                    </span>
                                    <p className="font-semibold">{customerFound.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Documento:</span>
                                    <p className="font-mono">{customerFound.document_type}: {customerFound.document_number}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Teléfono:</span>
                                    <p>{customerFound.phone || '-'}</p>
                                </div>
                                {customerFound.email && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Email:</span>
                                        <p>{customerFound.email}</p>
                                    </div>
                                )}
                                {customerFound.address && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Dirección:</span>
                                        <p>{customerFound.address}</p>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleSelectFoundCustomer}
                                className="w-full"
                            >
                                Seleccionar Cliente
                            </Button>
                        </div>
                    )}

                    {/* Formulario de Creación */}
                    {showCreateForm && (
                        <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
                            <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                <Plus className="h-5 w-5" />
                                {newCustomerData.name ? 'Datos Obtenidos - Completar Registro' : 'Cliente No Encontrado - Crear Nuevo'}
                            </div>
                            {newCustomerData.name && (
                                <p className="text-sm text-blue-600">
                                    Se encontraron datos en {newCustomerData.document_type === 'RUC' ? 'SUNAT' : 'RENIEC'}.
                                    Verifica y completa la información.
                                </p>
                            )}

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Tipo de Documento *</Label>
                                        <Select
                                            value={newCustomerData.document_type}
                                            onValueChange={(value) =>
                                                setNewCustomerData({ ...newCustomerData, document_type: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DNI">DNI</SelectItem>
                                                <SelectItem value="RUC">RUC</SelectItem>
                                                <SelectItem value="CE">CE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Número de Documento *</Label>
                                        <Input
                                            value={newCustomerData.document_number}
                                            onChange={(e) =>
                                                setNewCustomerData({ ...newCustomerData, document_number: e.target.value })
                                            }
                                            placeholder="Número"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>
                                        {newCustomerData.document_type === 'RUC' ? 'Razón Social *' : 'Nombre Completo *'}
                                    </Label>
                                    <Input
                                        value={newCustomerData.name}
                                        onChange={(e) =>
                                            setNewCustomerData({ ...newCustomerData, name: e.target.value })
                                        }
                                        placeholder={newCustomerData.document_type === 'RUC' ? 'Razón social de la empresa' : 'Nombre completo'}
                                        disabled={!!newCustomerData.name && newCustomerData.name.length > 0}
                                    />
                                    {newCustomerData.name && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Dato obtenido de {newCustomerData.document_type === 'RUC' ? 'SUNAT' : 'RENIEC'}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Teléfono</Label>
                                        <Input
                                            value={newCustomerData.phone}
                                            onChange={(e) =>
                                                setNewCustomerData({ ...newCustomerData, phone: e.target.value })
                                            }
                                            placeholder="999 999 999"
                                        />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={newCustomerData.email}
                                            onChange={(e) =>
                                                setNewCustomerData({ ...newCustomerData, email: e.target.value })
                                            }
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Dirección</Label>
                                    <Input
                                        value={newCustomerData.address}
                                        onChange={(e) =>
                                            setNewCustomerData({ ...newCustomerData, address: e.target.value })
                                        }
                                        placeholder="Dirección completa"
                                    />
                                    {newCustomerData.address && newCustomerData.document_type === 'RUC' && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Dato obtenido de SUNAT
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={handleCreateCustomer}
                                        disabled={!newCustomerData.name || !newCustomerData.document_number || creating}
                                        className="flex-1"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {creating ? 'Creando...' : 'Crear y Seleccionar'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botón Cerrar */}
                    {!customerFound && !showCreateForm && (
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleCloseModal}>
                                Cerrar
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}