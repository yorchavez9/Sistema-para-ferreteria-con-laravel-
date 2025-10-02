import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, ShoppingCart, Package, User, List, DollarSign, Search, UserPlus, Loader2, CheckCircle, Minus, Printer, XCircle, AlertTriangle, FileText, Receipt, UserCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';
import ProductSelectorModal from '@/components/ProductSelectorModal';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string;
    document_number: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
    sale_price: number;
    purchase_price?: number;
    igv_percentage: number;
    price_includes_igv: boolean;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
    total_stock?: number;
}

interface OrderDetail {
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
}

interface DocumentSerie {
    id: number;
    series: string;
    current_number: number;
}

interface SalesCreateProps {
    defaultBranchId?: number;
    customers: Customer[];
    branches: Branch[];
    products: Product[];
    documentSeries: {
        boleta: DocumentSerie[];
        factura: DocumentSerie[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ventas', href: '/sales' },
    { title: 'Nueva Venta', href: '#' },
];

export default function SalesCreate({ defaultBranchId, customers, branches, products, documentSeries }: SalesCreateProps) {
    // Auto-seleccionar la primera serie disponible para boleta por defecto
    const defaultSeriesId = documentSeries.boleta.length > 0
        ? documentSeries.boleta[0].id.toString()
        : '';

    // Buscar cliente "Varios"
    const clienteVarios = customers.find(c => c.document_number === '00000000');

    const [formData, setFormData] = useState({
        document_type: 'boleta',
        document_series_id: defaultSeriesId,
        customer_id: '',
        branch_id: defaultBranchId ? defaultBranchId.toString() : (branches[0]?.id.toString() || ''),
        sale_date: new Date().toISOString().split('T')[0],
        payment_method: 'efectivo',
        payment_type: 'contado',
        credit_days: '',
        installments: '',
        initial_payment: '',
        discount: '',
        amount_paid: '',
        notes: '',
    });

    const [details, setDetails] = useState<OrderDetail[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(clienteVarios || null);
    const [manuallyCleared, setManuallyCleared] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showPrintSizeModal, setShowPrintSizeModal] = useState(false);
    const [selectedPrintSize, setSelectedPrintSize] = useState<string>('');
    const [saleData, setSaleData] = useState<{ id: number; sale_number: string; total: number } | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showPriceCheckModal, setShowPriceCheckModal] = useState(false);
    const [priceCheckSearch, setPriceCheckSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Customer search states
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [showExternalSearchModal, setShowExternalSearchModal] = useState(false);
    const customerSearchRef = useRef<HTMLInputElement>(null);
    const customerDropdownRef = useRef<HTMLDivElement>(null);

    // External search (RENIEC/SUNAT) states
    const [externalDocument, setExternalDocument] = useState('');
    const [externalLoading, setExternalLoading] = useState(false);
    const [externalData, setExternalData] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [pendingCustomerData, setPendingCustomerData] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        document_type: 'DNI',
        document_number: '',
        phone: '',
        email: '',
        address: '',
    });

    // Estado para filas expandidas en la tabla de productos
    const [expandedProductRows, setExpandedProductRows] = useState<Set<number>>(new Set());

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const search = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category?.name.toLowerCase().includes(search) ||
            product.brand?.name.toLowerCase().includes(search)
        ).slice(0, 10);
    }, [products, searchTerm]);

    // Filter products for price check modal
    const priceCheckProducts = useMemo(() => {
        if (!priceCheckSearch) return [];
        const search = priceCheckSearch.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.code.toLowerCase().includes(search) ||
            product.category?.name.toLowerCase().includes(search) ||
            product.brand?.name.toLowerCase().includes(search)
        ).slice(0, 20);
    }, [products, priceCheckSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node) &&
                customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
                setShowCustomerDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search customers in real-time
    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearch.length < 2) {
                setCustomerResults([]);
                setShowCustomerDropdown(false);
                return;
            }

            setCustomerLoading(true);
            try {
                const response = await axios.get('/api/customers/search', {
                    params: { q: customerSearch }
                });
                setCustomerResults(response.data);
                setShowCustomerDropdown(true);
            } catch (error) {
                console.error('Error searching customers:', error);
                setCustomerResults([]);
            } finally {
                setCustomerLoading(false);
            }
        };

        const timeoutId = setTimeout(searchCustomers, 300);
        return () => clearTimeout(timeoutId);
    }, [customerSearch]);

    // Buscar automáticamente en RENIEC/SUNAT si es un DNI o RUC válido y no se encuentra
    const handleQuickExternalSearch = async (documentNumber: string) => {
        setCustomerLoading(true);
        setCustomerSearch('');
        try {
            const response = await axios.post('/customers/consultar-documento', {
                document_number: documentNumber
            });

            console.log('Respuesta de consultar-documento:', response.data);

            if (response.data.success) {
                if (response.data.found_in_db) {
                    // Cliente ya existe en BD
                    handleSelectCustomer(response.data.customer);
                    showSuccess('Cliente encontrado', 'El cliente ya está registrado en el sistema.');
                } else {
                    // Datos obtenidos de RENIEC/SUNAT - crear automáticamente
                    const docType = documentNumber.length === 8 ? 'DNI' : 'RUC';
                    const apiData = response.data.api_data;

                    // Construir el nombre completo desde los datos de la API
                    let fullName = '';

                    // Intentar obtener el nombre de diferentes formatos posibles
                    if (apiData.name) {
                        // Ya viene el nombre completo
                        fullName = apiData.name;
                    } else if (apiData.first_name && apiData.first_last_name) {
                        // Formato: nombres + apellidos
                        fullName = `${apiData.first_name} ${apiData.first_last_name} ${apiData.last_last_name || ''}`.trim();
                    } else if (apiData.nombres && apiData.apellidoPaterno) {
                        // Formato alternativo
                        fullName = `${apiData.nombres} ${apiData.apellidoPaterno} ${apiData.apellidoMaterno || ''}`.trim();
                    } else if (apiData.razon_social) {
                        // Para RUC
                        fullName = apiData.razon_social;
                    } else if (apiData.razonSocial) {
                        fullName = apiData.razonSocial;
                    }

                    if (!fullName) {
                        showError('Error', 'No se pudo obtener el nombre del cliente desde la API');
                        console.error('Estructura completa de apiData:', apiData);
                        return;
                    }

                    const customerData = {
                        name: fullName,
                        document_type: docType,
                        document_number: documentNumber,
                        phone: apiData.telefono || apiData.phone || '',
                        email: apiData.email || '',
                        address: apiData.direccion || apiData.domicilio || apiData.address || '',
                        customer_type: docType === 'DNI' ? 'personal' : 'empresa',
                    };

                    // Guardar datos y mostrar modal para teléfono
                    setPendingCustomerData(customerData);
                    setPhoneNumber('');
                    setShowPhoneModal(true);
                    setCustomerLoading(false);
                    setShowCustomerDropdown(false);
                }
            }
        } catch (error: any) {
            console.error('Error en búsqueda externa:', error);

            // Si no se encuentra en RENIEC/SUNAT, permitir creación manual
            if (error.response?.status === 400 || error.response?.data?.success === false) {
                // Abrir modal de creación manual
                const docType = documentNumber.length === 8 ? 'DNI' : documentNumber.length === 11 ? 'RUC' : 'CE';
                setNewCustomerData({
                    name: '',
                    document_type: docType,
                    document_number: documentNumber,
                    phone: '',
                    email: '',
                    address: '',
                });
                setExternalDocument(documentNumber);
                setShowExternalSearchModal(true);
                setShowCreateForm(true);
            } else {
                // Otros errores
                const errorMsg = error.response?.data?.message || 'No se pudo buscar el cliente';

                if (error.response?.data?.errors) {
                    const errors = error.response.data.errors;
                    const errorMessages = Object.entries(errors)
                        .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('\n');
                    showError('Error de validación', errorMessages);
                } else {
                    showError('Error', errorMsg);
                }
            }
        } finally {
            setCustomerLoading(false);
            setShowCustomerDropdown(false);
        }
    };

    // Show dropdown when typing
    useEffect(() => {
        if (searchTerm.trim()) {
            setShowDropdown(true);
            setHighlightedIndex(-1);
        } else {
            setShowDropdown(false);
        }
    }, [searchTerm]);

    // Calculate totals
    const { subtotal, tax, total: totalBeforeDiscount } = useMemo(() => {
        let calculatedSubtotal = 0;  // Precio sin IGV
        let calculatedTax = 0;        // Total de IGV
        let calculatedTotal = 0;      // Precio con IGV (antes de descuentos)

        // Si es nota de venta, NO calcular IGV
        const isNotaVenta = formData.document_type === 'nota_venta';

        details.forEach(detail => {
            const product = detail.product;
            if (!product) return;

            const lineTotal = detail.quantity * detail.unit_price;

            // Para nota de venta: NO calcular IGV
            if (isNotaVenta) {
                calculatedSubtotal += lineTotal;
                calculatedTotal += lineTotal;
                return;
            }

            // Para boleta y factura: calcular IGV según configuración del producto
            if (product.price_includes_igv && product.igv_percentage > 0) {
                // Precio sin IGV = Precio con IGV / (1 + IGV%)
                const igvMultiplier = 1 + (product.igv_percentage / 100);
                const lineSubtotalWithoutIgv = lineTotal / igvMultiplier;
                const lineIgv = lineTotal - lineSubtotalWithoutIgv;

                calculatedSubtotal += lineSubtotalWithoutIgv;
                calculatedTax += lineIgv;
                calculatedTotal += lineTotal;
            } else if (!product.price_includes_igv && product.igv_percentage > 0) {
                // El precio NO incluye IGV, calcular hacia adelante
                const lineIgv = lineTotal * (product.igv_percentage / 100);

                calculatedSubtotal += lineTotal;
                calculatedTax += lineIgv;
                calculatedTotal += lineTotal + lineIgv;
            } else {
                // Producto sin IGV
                calculatedSubtotal += lineTotal;
                calculatedTotal += lineTotal;
            }
        });

        return {
            subtotal: calculatedSubtotal,
            tax: calculatedTax,
            total: calculatedTotal
        };
    }, [details, formData.document_type]);

    const discount = useMemo(() => {
        return parseFloat(formData.discount) || 0;
    }, [formData.discount]);

    const total = useMemo(() => {
        return totalBeforeDiscount - discount;
    }, [totalBeforeDiscount, discount]);

    const changeAmount = useMemo(() => {
        const paid = parseFloat(formData.amount_paid) || 0;
        return Math.max(0, paid - total);
    }, [formData.amount_paid, total]);

    // Auto-fill amount_paid with total when it changes (only for contado)
    useEffect(() => {
        if (formData.payment_type === 'contado' && total > 0) {
            setFormData(prev => ({
                ...prev,
                amount_paid: total.toFixed(2)
            }));
        }
    }, [total, formData.payment_type]);

    // Auto-seleccionar Cliente Varios cuando sea apropiado
    useEffect(() => {
        if (formData.document_type === 'factura') {
            // Para factura, limpiar el cliente si es "Varios"
            if (selectedCustomer?.document_number === '00000000') {
                setSelectedCustomer(null);
                setManuallyCleared(false);
            }
        } else if (formData.document_type === 'boleta' && total >= 700) {
            // Para boleta >= 700, limpiar el cliente si es "Varios"
            if (selectedCustomer?.document_number === '00000000') {
                setSelectedCustomer(null);
                setManuallyCleared(false);
            }
        } else {
            // Para nota de venta o boleta < 700, auto-seleccionar "Cliente Varios" si no hay cliente
            // SOLO si el usuario no acaba de limpiar manualmente
            if (!selectedCustomer && clienteVarios && !manuallyCleared) {
                setSelectedCustomer(clienteVarios);
            }
        }
    }, [formData.document_type, total, clienteVarios, selectedCustomer, manuallyCleared]);

    // Obtener series disponibles según tipo de documento
    const availableSeries = useMemo(() => {
        if (formData.document_type === 'boleta') {
            return documentSeries.boleta;
        } else if (formData.document_type === 'factura') {
            return documentSeries.factura;
        }
        return [];
    }, [formData.document_type, documentSeries]);

    // Generar número de comprobante preview
    const documentNumberPreview = useMemo(() => {
        if (formData.document_type === 'nota_venta') {
            return 'NV-00000001';
        }

        if (!formData.document_series_id) {
            if (availableSeries.length > 0) {
                const serie = availableSeries[0];
                const nextNumber = String(serie.current_number + 1).padStart(8, '0');
                return `${serie.series}-${nextNumber}`;
            }
            return 'Selecciona una serie';
        }

        const selectedSerie = availableSeries.find(s => s.id.toString() === formData.document_series_id);
        if (selectedSerie) {
            const nextNumber = String(selectedSerie.current_number + 1).padStart(8, '0');
            return `${selectedSerie.series}-${nextNumber}`;
        }

        return '-';
    }, [formData.document_type, formData.document_series_id, availableSeries]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validar cliente según reglas SUNAT
        if (formData.document_type === 'factura') {
            // Factura: Cliente siempre obligatorio
            if (!selectedCustomer) {
                showError('Error de validación', 'Para emitir una FACTURA debes seleccionar un cliente.');
                return;
            }
        } else if (formData.document_type === 'boleta') {
            // Boleta: Cliente obligatorio si el monto es >= S/ 700
            if (total >= 700 && !selectedCustomer) {
                showError('Error de validación', 'Para BOLETAS de S/ 700 o más debes seleccionar un cliente (Norma SUNAT).');
                return;
            }
        }
        // Nota de venta: Cliente opcional (no se valida)

        if (details.length === 0) {
            showError('Error de validación', 'Debes agregar al menos un producto.');
            return;
        }

        const hasInvalidQuantity = details.some(detail => detail.quantity <= 0);
        if (hasInvalidQuantity) {
            showError('Error de validación', 'Todas las cantidades deben ser mayores a 0.');
            return;
        }

        const hasInvalidPrice = details.some(detail => detail.unit_price < 0);
        if (hasInvalidPrice) {
            showError('Error de validación', 'Todos los precios deben ser mayores o iguales a 0.');
            return;
        }

        // Validación de monto pagado solo para contado
        if (formData.payment_type === 'contado') {
            const amountPaid = parseFloat(formData.amount_paid) || 0;
            if (amountPaid < total) {
                showError('Error de validación', 'El monto pagado debe ser mayor o igual al total.');
                return;
            }
        }

        // Validación para crédito
        if (formData.payment_type === 'credito') {
            if (!formData.credit_days) {
                showError('Error de validación', 'Debes seleccionar los días de crédito.');
                return;
            }
            if (!formData.installments || parseInt(formData.installments) < 1) {
                showError('Error de validación', 'Debes especificar el número de cuotas.');
                return;
            }
            const initialPayment = parseFloat(formData.initial_payment) || 0;
            if (initialPayment >= total) {
                showError('Error de validación', 'El pago inicial debe ser menor al total de la venta.');
                return;
            }
        }

        // Mostrar modal para seleccionar tamaño de comprobante
        setShowPrintSizeModal(true);
    };

    const handlePrintSizeSelected = async (size: string) => {
        setSelectedPrintSize(size);
        setLoading(true);

        if (!selectedCustomer) {
            setLoading(false);
            setShowPrintSizeModal(false);
            return;
        }

        const submitData = {
            document_type: formData.document_type,
            document_series_id: formData.document_type !== 'nota_venta' ? formData.document_series_id || null : null,
            customer_id: selectedCustomer ? selectedCustomer.id : null,
            branch_id: formData.branch_id,
            sale_date: formData.sale_date,
            payment_method: formData.payment_method,
            payment_type: formData.payment_type,
            credit_days: formData.payment_type === 'credito' ? formData.credit_days : null,
            installments: formData.payment_type === 'credito' ? formData.installments : null,
            initial_payment: formData.payment_type === 'credito' ? (formData.initial_payment || 0) : null,
            discount: formData.discount || 0,
            amount_paid: formData.payment_type === 'contado' ? formData.amount_paid : (formData.initial_payment || 0),
            notes: formData.notes || null,
            details: details.map(detail => ({
                product_id: detail.product_id,
                quantity: detail.quantity,
                unit_price: detail.unit_price,
            })),
        };

        try {
            console.log('Enviando datos de venta...', submitData);
            const response = await axios.post('/sales', submitData);
            console.log('Respuesta recibida:', response.data);

            if (response.data.success) {
                const saleId = response.data.sale.id;
                console.log('Venta creada con ID:', saleId);

                setSaleData(response.data.sale);

                // 🎉 Lanzar confetti cuando la venta se registra exitosamente
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                // Cerrar modal de selección y resetear loading
                setLoading(false);
                setShowPrintSizeModal(false);

                // Construir URL del PDF
                const pdfUrlGenerated = `/sales/${saleId}/pdf?size=${size}&action=print`;
                console.log('PDF URL generada:', pdfUrlGenerated);

                // Mostrar alerta de éxito y LUEGO mostrar el PDF cuando presione OK
                showSuccess(
                    '¡Venta Registrada Exitosamente!',
                    `La venta ${response.data.sale.sale_number} ha sido registrada correctamente por un total de S/ ${response.data.sale.total}`
                ).then(() => {
                    // Cuando el usuario presiona OK, mostrar el modal del PDF
                    setPdfUrl(pdfUrlGenerated);
                    setShowPdfModal(true);
                });
            } else {
                console.error('Respuesta no exitosa:', response.data);
                setLoading(false);
                setShowPrintSizeModal(false);
                showError('Error', 'No se pudo crear la venta.');
            }
        } catch (error: any) {
            console.error('Error completo:', error);
            console.error('Error response:', error.response);
            setLoading(false);
            setShowPrintSizeModal(false);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                setErrors(errors);

                const errorMessages = Object.entries(errors).map(([field, messages]) => {
                    const messageArray = Array.isArray(messages) ? messages : [messages];
                    return `${field}: ${messageArray.join(', ')}`;
                }).join('\n');

                showError('Error al crear venta', errorMessages);
            } else {
                showError('Error al crear venta', error.response?.data?.message || 'Por favor, revisa los campos y vuelve a intentar.');
            }
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addProductById = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingIndex = details.findIndex(d => d.product_id === productId);
        if (existingIndex !== -1) {
            const newDetails = [...details];
            newDetails[existingIndex].quantity += 1;
            setDetails(newDetails);
        } else {
            setDetails([...details, {
                product_id: product.id,
                product: product,
                quantity: 1,
                unit_price: Number(product.sale_price || 0),
            }]);
        }

        setSearchTerm('');
        setShowDropdown(false);
        setHighlightedIndex(-1);

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || filteredProducts.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const exactMatch = products.find(p =>
                    p.code.toLowerCase() === searchTerm.toLowerCase().trim()
                );
                if (exactMatch) {
                    addProductById(exactMatch.id);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredProducts.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
                    addProductById(filteredProducts[highlightedIndex].id);
                } else if (filteredProducts.length > 0) {
                    addProductById(filteredProducts[0].id);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const removeProduct = (index: number) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const updateDetail = (index: number, field: 'quantity' | 'unit_price', value: string) => {
        const newDetails = [...details];
        const numValue = parseFloat(value) || 0;
        newDetails[index][field] = numValue;
        setDetails(newDetails);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customer_id: customer.id.toString() }));
        setCustomerSearch('');
        setShowCustomerDropdown(false);
        setManuallyCleared(false);
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setCustomerSearch('');
        setFormData(prev => ({ ...prev, customer_id: '' }));
        setManuallyCleared(true);
    };

    const toggleProductRowExpansion = (index: number) => {
        const newExpanded = new Set(expandedProductRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedProductRows(newExpanded);
    };

    const handleSearchExternalDocument = async () => {
        if (!externalDocument || externalDocument.length < 8) {
            showError('Error', 'Ingresa un número de documento válido (DNI: 8 dígitos, RUC: 11 dígitos)');
            return;
        }

        setExternalLoading(true);
        try {
            const response = await axios.post('/customers/consultar-documento', {
                document_number: externalDocument
            });

            if (response.data.success) {
                if (response.data.found_in_db) {
                    // Cliente ya existe en BD
                    handleSelectCustomer(response.data.customer);
                    setShowExternalSearchModal(false);
                    showSuccess('Cliente encontrado', 'El cliente ya está registrado en el sistema.');
                } else {
                    // Datos obtenidos de RENIEC/SUNAT
                    setExternalData(response.data.api_data);
                    setShowCreateForm(true);

                    // Pre-llenar el formulario
                    const docType = externalDocument.length === 8 ? 'DNI' : externalDocument.length === 11 ? 'RUC' : 'CE';
                    setNewCustomerData({
                        name: response.data.api_data.nombre || response.data.api_data.razon_social || '',
                        document_type: docType,
                        document_number: externalDocument,
                        phone: '',
                        email: '',
                        address: response.data.api_data.direccion || '',
                    });
                }
            }
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'No se pudo consultar el documento');
        } finally {
            setExternalLoading(false);
        }
    };

    const handleCreateCustomer = async () => {
        setExternalLoading(true);
        try {
            const response = await axios.post('/customers/quick-store', newCustomerData);

            if (response.data.success) {
                handleSelectCustomer(response.data.customer);
                setShowExternalSearchModal(false);
                setShowCreateForm(false);
                setExternalDocument('');
                setExternalData(null);
                showSuccess('Cliente creado', 'El cliente ha sido registrado exitosamente.');
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                const errorMessages = Object.values(errors).flat().join('\n');
                showError('Error de validación', errorMessages);
            } else {
                showError('Error', error.response?.data?.message || 'No se pudo crear el cliente');
            }
        } finally {
            setExternalLoading(false);
        }
    };

    const handleConfirmCreateWithPhone = async () => {
        if (!pendingCustomerData) return;

        setExternalLoading(true);
        try {
            const dataToSend = {
                ...pendingCustomerData,
                phone: phoneNumber || pendingCustomerData.phone,
            };

            const response = await axios.post('/customers/quick-store', dataToSend);

            if (response.data.success) {
                handleSelectCustomer(response.data.customer);
                setShowPhoneModal(false);
                setPendingCustomerData(null);
                setPhoneNumber('');
                showSuccess('Cliente creado', 'Cliente registrado exitosamente.');
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                const errorMessages = Object.values(errors).flat().join('\n');
                showError('Error de validación', errorMessages);
            } else {
                showError('Error', error.response?.data?.message || 'No se pudo crear el cliente');
            }
        } finally {
            setExternalLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Venta" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/sales">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Venta</h1>
                        <p className="text-muted-foreground">
                            Registra una nueva venta de productos
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

 {/* 2. Información del Comprobante */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Información del Comprobante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="document_type">Tipo de Comprobante *</Label>
                                    <Select
                                        value={formData.document_type}
                                        onValueChange={(value) => {
                                            handleChange('document_type', value);
                                            // Auto-seleccionar la primera serie disponible
                                            const seriesForType = value === 'boleta'
                                                ? documentSeries.boleta
                                                : value === 'factura'
                                                ? documentSeries.factura
                                                : [];

                                            if (seriesForType.length > 0) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    document_type: value,
                                                    document_series_id: seriesForType[0].id.toString()
                                                }));
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    document_type: value,
                                                    document_series_id: ''
                                                }));
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="document_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="boleta">Boleta</SelectItem>
                                            <SelectItem value="factura">Factura</SelectItem>
                                            <SelectItem value="nota_venta">Nota de Venta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.document_type !== 'nota_venta' && availableSeries.length > 0 && (
                                    <div>
                                        <Label htmlFor="document_series_id">Serie</Label>
                                        <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-semibold">
                                            {availableSeries.find(s => s.id.toString() === formData.document_series_id)?.series || 'N/A'}
                                        </div>
                                    </div>
                                )}

                                <div className={formData.document_type !== 'nota_venta' ? 'md:col-span-2' : 'md:col-span-3'}>
                                    <Label>Número de Comprobante</Label>
                                    <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-mono text-lg font-semibold">
                                        {documentNumberPreview}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Se generará automáticamente
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* 1. Información General: Sucursal, Cliente y Fecha */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5" />
                                Información del cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Cliente - Ocupa 2 columnas en desktop */}
                                <div className="md:col-span-2">
                                    {!selectedCustomer ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="customer-search" className="text-sm font-medium">
                                                Cliente {formData.document_type === 'factura' || (formData.document_type === 'boleta' && total >= 700) ? '*' : '(Opcional)'}
                                            </Label>
                                            <div className="relative">
                                                <div className="relative">
                                                    <Input
                                                        ref={customerSearchRef}
                                                        id="customer-search"
                                                        placeholder="Buscar por nombre, DNI o RUC..."
                                                        value={customerSearch}
                                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                                        autoComplete="off"
                                                        className="pr-10"
                                                    />
                                                    {customerLoading ? (
                                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                                                    ) : (
                                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>

                                                {/* Dropdown de resultados */}
                                                {showCustomerDropdown && customerResults.length > 0 && (
                                                    <div
                                                        ref={customerDropdownRef}
                                                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-auto"
                                                    >
                                                        {customerResults.map((customer) => (
                                                            <button
                                                                key={customer.id}
                                                                type="button"
                                                                onClick={() => handleSelectCustomer(customer)}
                                                                className="w-full text-left px-4 py-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-sm">{customer.name}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            {customer.document_type}: {customer.document_number}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex-shrink-0">
                                                                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                                                            {customer.code}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* No se encontraron resultados */}
                                                {showCustomerDropdown && customerSearch.length >= 2 && customerResults.length === 0 && !customerLoading && (
                                                    <div
                                                        ref={customerDropdownRef}
                                                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4"
                                                    >
                                                        <div className="text-center">
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                No se encontró el cliente en la base de datos
                                                            </p>
                                                            {(customerSearch.length === 8 || customerSearch.length === 11) && /^\d+$/.test(customerSearch) ? (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => handleQuickExternalSearch(customerSearch)}
                                                                >
                                                                    <Search className="h-4 w-4 mr-2" />
                                                                    Buscar en {customerSearch.length === 8 ? 'RENIEC' : 'SUNAT'} ({customerSearch})
                                                                </Button>
                                                            ) : (
                                                                <p className="text-xs text-amber-600">
                                                                    Ingresa un DNI (8 dígitos) o RUC (11 dígitos) válido para buscar
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {formData.document_type === 'factura' ? (
                                                    <p className="text-xs text-amber-600 dark:text-amber-500 font-medium flex-1">
                                                        ⚠ Cliente obligatorio para FACTURAS
                                                    </p>
                                                ) : formData.document_type === 'boleta' && total >= 700 ? (
                                                    <p className="text-xs text-amber-600 dark:text-amber-500 font-medium flex-1">
                                                        ⚠ Cliente obligatorio para BOLETAS ≥ S/ 700 (Norma SUNAT)
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground flex-1">
                                                        Escribe mínimo 2 caracteres para buscar
                                                    </p>
                                                )}
                                                {clienteVarios && formData.document_type !== 'factura' && (formData.document_type === 'nota_venta' || (formData.document_type === 'boleta' && total < 700)) && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSelectCustomer(clienteVarios)}
                                                        className="text-xs"
                                                    >
                                                        <User className="h-3 w-3 mr-1" />
                                                        Cliente Varios
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label htmlFor="customer-selected" className="text-sm font-medium">Cliente</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 border rounded-lg px-3 py-2.5 bg-muted/50">
                                                    <p className="text-sm font-semibold truncate">
                                                        {selectedCustomer.document_type}: {selectedCustomer.document_number} - {selectedCustomer.name}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleClearCustomer}
                                                >
                                                    Cambiar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Fecha - Ocupa 1 columna en desktop */}
                                <div className="md:col-span-1">
                                    <Label htmlFor="sale_date" className="text-sm font-medium">Fecha *</Label>
                                    <Input
                                        id="sale_date"
                                        type="date"
                                        value={formData.sale_date}
                                        onChange={(e) => handleChange('sale_date', e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                   
                    {/* Productos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Product Selector */}
                            <div className="relative">
                                <Label htmlFor="product-search" className="text-base font-semibold">Buscar Producto</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="relative flex-1">
                                        <Input
                                            ref={searchInputRef}
                                            id="product-search"
                                            placeholder="Escribe el código de barras o nombre del producto..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleSearchKeyDown}
                                            autoComplete="off"
                                            className="pr-10 h-12 text-base font-semibold border-2 focus:border-primary"
                                        />
                                        <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowPriceCheckModal(true)}
                                        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Consultar Precios
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowProductModal(true)}
                                    >
                                        <List className="h-4 w-4 mr-2" />
                                        Catálogo
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Escribe para buscar o escanea el código de barras y presiona Enter
                                </p>

                                {/* Dropdown Results */}
                                {showDropdown && filteredProducts.length > 0 && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute z-50 w-full mt-1 bg-popover border-2 border-primary/20 rounded-lg shadow-2xl max-h-[400px] overflow-auto"
                                    >
                                        {filteredProducts.map((product, index) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => addProductById(product.id)}
                                                className={`w-full text-left px-4 py-3 hover:bg-primary/5 cursor-pointer transition-all border-b last:border-b-0 ${
                                                    index === highlightedIndex ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-4 w-full">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-block px-3 py-1.5 text-sm font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                                                                {product.code}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-base truncate">{product.name}</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                                                                <span>{product.category?.name || 'Sin categoría'}</span>
                                                                <span>•</span>
                                                                <span>{product.brand?.name || 'Sin marca'}</span>
                                                                {product.total_stock !== undefined && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className={`font-bold ${
                                                                            product.total_stock > 10 ? 'text-green-600' :
                                                                            product.total_stock > 0 ? 'text-orange-600' :
                                                                            'text-red-600'
                                                                        }`}>
                                                                            Stock: {product.total_stock}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-right bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                                                        <p className="font-bold text-2xl text-green-700 dark:text-green-400">
                                                            S/ {Number(product.sale_price || 0).toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-green-600 dark:text-green-500 font-medium">Precio Venta</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No Results Message */}
                                {showDropdown && searchTerm && filteredProducts.length === 0 && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4"
                                    >
                                        <p className="text-sm text-muted-foreground text-center">
                                            No se encontraron productos
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Products Table */}
                            {details.length > 0 ? (
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="md:hidden w-10"></TableHead>
                                                <TableHead className="hidden md:table-cell text-xs">Código</TableHead>
                                                <TableHead className="text-xs">Producto</TableHead>
                                                <TableHead className="hidden md:table-cell text-xs">Categoría</TableHead>
                                                <TableHead className="hidden md:table-cell text-xs">Marca</TableHead>
                                                <TableHead className="hidden md:table-cell w-32 text-xs">Cantidad</TableHead>
                                                <TableHead className="hidden md:table-cell w-40 text-xs">Precio Unit.</TableHead>
                                                <TableHead className="text-right text-xs">Subtotal</TableHead>
                                                <TableHead className="w-16"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.map((detail, index) => {
                                                const isExpanded = expandedProductRows.has(index);
                                                return (
                                                    <Fragment key={index}>
                                                        <TableRow>
                                                            {/* Botón expandir (móvil) */}
                                                            <TableCell className="md:hidden w-10 p-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleProductRowExpansion(index)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    {isExpanded ? (
                                                                        <Minus className="h-4 w-4" />
                                                                    ) : (
                                                                        <Plus className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </TableCell>

                                                            {/* Código (desktop) */}
                                                            <TableCell className="hidden md:table-cell font-mono text-xs">
                                                                {detail.product?.code}
                                                            </TableCell>

                                                            {/* Producto */}
                                                            <TableCell className="font-medium text-sm">
                                                                {detail.product?.name}
                                                                <div className="md:hidden text-xs text-muted-foreground mt-1">
                                                                    {detail.product?.code}
                                                                </div>
                                                            </TableCell>

                                                            {/* Categoría (desktop) */}
                                                            <TableCell className="hidden md:table-cell text-xs">
                                                                {detail.product?.category?.name || '-'}
                                                            </TableCell>

                                                            {/* Marca (desktop) */}
                                                            <TableCell className="hidden md:table-cell text-xs">
                                                                {detail.product?.brand?.name || '-'}
                                                            </TableCell>

                                                            {/* Cantidad (desktop) */}
                                                            <TableCell className="hidden md:table-cell">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={detail.quantity}
                                                                    onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
                                                                    className="w-full h-9 text-sm"
                                                                />
                                                            </TableCell>

                                                            {/* Precio (desktop) */}
                                                            <TableCell className="hidden md:table-cell">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={detail.unit_price}
                                                                    onChange={(e) => updateDetail(index, 'unit_price', e.target.value)}
                                                                    className="w-full h-9 text-sm"
                                                                />
                                                            </TableCell>

                                                            {/* Subtotal */}
                                                            <TableCell className="text-right font-semibold text-sm">
                                                                {formatCurrency(detail.quantity * detail.unit_price)}
                                                            </TableCell>

                                                            {/* Eliminar */}
                                                            <TableCell className="p-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeProduct(index)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>

                                                        {/* Fila expandida (móvil) */}
                                                        {isExpanded && (
                                                            <TableRow className="md:hidden bg-muted/50">
                                                                <TableCell colSpan={4} className="p-4">
                                                                    <div className="space-y-3">
                                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                                            <div>
                                                                                <span className="text-muted-foreground">Categoría:</span>
                                                                                <p className="font-medium">{detail.product?.category?.name || '-'}</p>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-muted-foreground">Marca:</span>
                                                                                <p className="font-medium">{detail.product?.brand?.name || '-'}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <div>
                                                                                <Label className="text-xs">Cantidad</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={detail.quantity}
                                                                                    onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
                                                                                    className="h-9 text-sm"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-xs">Precio Unitario</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min="0"
                                                                                    value={detail.unit_price}
                                                                                    onChange={(e) => updateDetail(index, 'unit_price', e.target.value)}
                                                                                    className="h-9 text-sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-6 border rounded-lg bg-muted/20">
                                    <p className="text-muted-foreground">
                                        No hay productos agregados
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. Totales, Pago y Observaciones */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pago y Observaciones - IZQUIERDA */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pago y Observaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="payment_type">Tipo de Pago *</Label>
                                    <Select
                                        value={formData.payment_type}
                                        onValueChange={(value) => {
                                            handleChange('payment_type', value);
                                            // Limpiar campos de crédito si cambia a contado
                                            if (value === 'contado') {
                                                handleChange('credit_days', '');
                                                handleChange('installments', '');
                                                handleChange('initial_payment', '');
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="payment_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contado">Al Contado</SelectItem>
                                            <SelectItem value="credito">A Crédito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.payment_type === 'credito' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3 p-3 border rounded-md bg-blue-50">
                                            <div>
                                                <Label htmlFor="credit_days">Días de Crédito *</Label>
                                                <Select
                                                    value={formData.credit_days}
                                                    onValueChange={(value) => handleChange('credit_days', value)}
                                                >
                                                    <SelectTrigger id="credit_days">
                                                        <SelectValue placeholder="Días" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 días</SelectItem>
                                                        <SelectItem value="30">30 días</SelectItem>
                                                        <SelectItem value="45">45 días</SelectItem>
                                                        <SelectItem value="60">60 días</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="installments">Nº de Cuotas *</Label>
                                                <Input
                                                    id="installments"
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={formData.installments}
                                                    onChange={(e) => handleChange('installments', e.target.value)}
                                                    placeholder="Ej: 3"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <Label htmlFor="initial_payment">Pago Inicial/Enganche (S/)</Label>
                                                <Input
                                                    id="initial_payment"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.initial_payment}
                                                    onChange={(e) => handleChange('initial_payment', e.target.value)}
                                                    placeholder="0.00"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Opcional. El resto se dividirá en cuotas.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <Label htmlFor="payment_method">Método de Pago *</Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) => handleChange('payment_method', value)}
                                    >
                                        <SelectTrigger id="payment_method">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                            <SelectItem value="yape">Yape</SelectItem>
                                            <SelectItem value="plin">Plin</SelectItem>
                                            <SelectItem value="credito">Crédito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.payment_type === 'contado' && (
                                    <>
                                        <div>
                                            <Label htmlFor="amount_paid">Monto Pagado (S/) *</Label>
                                            <Input
                                                id="amount_paid"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.amount_paid}
                                                onChange={(e) => handleChange('amount_paid', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <Label>Vuelto (S/)</Label>
                                            <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-mono text-lg font-semibold text-green-600">
                                                {formatCurrency(changeAmount)}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {formData.payment_type === 'credito' && (
                                    <div className="p-3 border rounded-md bg-amber-50">
                                        <p className="text-sm font-semibold text-amber-800">Venta a Crédito</p>
                                        <div className="mt-2 space-y-1 text-sm text-amber-700">
                                            <p>• Total a pagar: <span className="font-semibold">{formatCurrency(total)}</span></p>
                                            <p>• Pago inicial: <span className="font-semibold">{formatCurrency(parseFloat(formData.initial_payment) || 0)}</span></p>
                                            <p>• Saldo en cuotas: <span className="font-semibold">{formatCurrency(total - (parseFloat(formData.initial_payment) || 0))}</span></p>
                                            {formData.installments && (
                                                <p>• Monto por cuota: <span className="font-semibold">
                                                    {formatCurrency((total - (parseFloat(formData.initial_payment) || 0)) / parseInt(formData.installments))}
                                                </span></p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="notes">Observaciones</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder="Notas adicionales sobre la venta..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Totales - DERECHA */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Resumen de Totales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {details.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-base">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span className="font-semibold">
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>
                                        {formData.document_type !== 'nota_venta' && tax > 0 && (
                                            <div className="flex justify-between text-base">
                                                <span className="text-muted-foreground">IGV:</span>
                                                <span className="font-semibold">
                                                    {formatCurrency(tax)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <Label htmlFor="discount">Descuento (S/)</Label>
                                            <Input
                                                id="discount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.discount}
                                                onChange={(e) => handleChange('discount', e.target.value)}
                                                placeholder="0.00"
                                                className="mt-1"
                                            />
                                        </div>

                                        {discount > 0 && (
                                            <div className="flex justify-between text-base">
                                                <span className="text-muted-foreground">Descuento:</span>
                                                <span className="font-semibold text-red-600">
                                                    - {formatCurrency(discount)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-2xl font-bold border-t pt-3 mt-3">
                                            <span>Total a Pagar:</span>
                                            <span className="text-primary">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6">
                                        Agrega productos para ver el resumen
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        {/* Alertas a la izquierda en desktop, arriba en móvil */}
                        <div className="flex-1">
                            {details.length === 0 ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                                        Agrega al menos un producto
                                    </span>
                                </div>
                            ) : formData.document_type === 'factura' && !selectedCustomer ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                                        Cliente obligatorio para FACTURAS
                                    </span>
                                </div>
                            ) : formData.document_type === 'boleta' && total >= 700 && !selectedCustomer ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                                        Cliente obligatorio para BOLETAS ≥ S/ 700
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {/* Botones a la derecha en desktop, abajo en móvil */}
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={
                                    loading ||
                                    details.length === 0 ||
                                    (formData.document_type === 'factura' && !selectedCustomer) ||
                                    (formData.document_type === 'boleta' && total >= 700 && !selectedCustomer)
                                }
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {loading ? 'Procesando...' : 'Registrar Venta'}
                            </Button>
                            <Link href="/sales">
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </form>

                {/* Modals */}
                <ProductSelectorModal
                    open={showProductModal}
                    onClose={() => setShowProductModal(false)}
                    products={products}
                    onAddProduct={addProductById}
                />

                {/* Modal de Consulta de Precios */}
                {showPriceCheckModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Consulta de Precios</h2>
                                        <p className="text-sm text-muted-foreground">Busca productos y consulta sus precios</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowPriceCheckModal(false);
                                        setPriceCheckSearch('');
                                    }}
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="p-6 border-b">
                                <div className="relative">
                                    <Input
                                        placeholder="Buscar por código, nombre, categoría o marca..."
                                        value={priceCheckSearch}
                                        onChange={(e) => setPriceCheckSearch(e.target.value)}
                                        autoFocus
                                        className="pr-10 h-12 text-base"
                                    />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Results */}
                            <div className="flex-1 overflow-auto p-6">
                                {priceCheckSearch && priceCheckProducts.length > 0 ? (
                                    <div className="grid gap-3">
                                        {priceCheckProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-block px-3 py-2 text-base font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                                                                {product.code}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-lg truncate">{product.name}</h3>
                                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                                <span>{product.category?.name || 'Sin categoría'}</span>
                                                                <span>•</span>
                                                                <span>{product.brand?.name || 'Sin marca'}</span>
                                                                {product.total_stock !== undefined && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className={`font-bold ${
                                                                            product.total_stock > 10 ? 'text-green-600' :
                                                                            product.total_stock > 0 ? 'text-orange-600' :
                                                                            'text-red-600'
                                                                        }`}>
                                                                            Stock: {product.total_stock}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-lg">
                                                            <p className="font-bold text-3xl text-green-700 dark:text-green-400">
                                                                S/ {Number(product.sale_price || 0).toFixed(2)}
                                                            </p>
                                                            <p className="text-sm text-green-600 dark:text-green-500 font-medium">Precio Venta</p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => {
                                                                addProductById(product.id);
                                                                setShowPriceCheckModal(false);
                                                                setPriceCheckSearch('');
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Agregar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : priceCheckSearch ? (
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-lg font-medium text-muted-foreground">No se encontraron productos</p>
                                        <p className="text-sm text-muted-foreground mt-1">Intenta con otro término de búsqueda</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-lg font-medium text-muted-foreground">Busca un producto para ver su precio</p>
                                        <p className="text-sm text-muted-foreground mt-1">Escribe el código, nombre, categoría o marca</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {priceCheckProducts.length > 0 && `${priceCheckProducts.length} producto${priceCheckProducts.length !== 1 ? 's' : ''} encontrado${priceCheckProducts.length !== 1 ? 's' : ''}`}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowPriceCheckModal(false);
                                            setPriceCheckSearch('');
                                        }}
                                    >
                                        Cerrar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para búsqueda en RENIEC/SUNAT */}
                {showExternalSearchModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Buscar en RENIEC/SUNAT
                            </h3>

                            {!showCreateForm ? (
                                <>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Ingresa el número de DNI (8 dígitos) o RUC (11 dígitos) para buscar los datos del cliente.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="external-document">Número de Documento</Label>
                                            <Input
                                                id="external-document"
                                                type="text"
                                                placeholder="DNI o RUC"
                                                value={externalDocument}
                                                onChange={(e) => setExternalDocument(e.target.value)}
                                                maxLength={11}
                                                disabled={externalLoading}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setShowExternalSearchModal(false);
                                                    setExternalDocument('');
                                                    setExternalData(null);
                                                    setShowCreateForm(false);
                                                }}
                                                disabled={externalLoading}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                onClick={handleSearchExternalDocument}
                                                disabled={externalLoading || !externalDocument}
                                            >
                                                {externalLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Buscando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="h-4 w-4 mr-2" />
                                                        Buscar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {externalData ? (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-sm text-green-800 font-medium">
                                                ✓ Datos encontrados en {externalDocument.length === 8 ? 'RENIEC' : 'SUNAT'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <p className="text-sm text-amber-800 font-medium">
                                                ⚠ No se encontró en {externalDocument.length === 8 ? 'RENIEC' : 'SUNAT'}
                                            </p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                Ingresa los datos manualmente para crear el cliente
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="new-customer-name">Nombre / Razón Social *</Label>
                                            <Input
                                                id="new-customer-name"
                                                value={newCustomerData.name}
                                                onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                                                disabled={externalLoading}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Tipo Documento</Label>
                                                <Input
                                                    value={newCustomerData.document_type}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label>Número</Label>
                                                <Input
                                                    value={newCustomerData.document_number}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="new-customer-address">Dirección</Label>
                                            <Input
                                                id="new-customer-address"
                                                value={newCustomerData.address}
                                                onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                                                disabled={externalLoading}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="new-customer-phone">Teléfono</Label>
                                                <Input
                                                    id="new-customer-phone"
                                                    value={newCustomerData.phone}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                                                    disabled={externalLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="new-customer-email">Email</Label>
                                                <Input
                                                    id="new-customer-email"
                                                    type="email"
                                                    value={newCustomerData.email}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                                                    disabled={externalLoading}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setExternalDocument('');
                                                    setExternalData(null);
                                                }}
                                                disabled={externalLoading}
                                            >
                                                Volver
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                onClick={handleCreateCustomer}
                                                disabled={externalLoading || !newCustomerData.name}
                                            >
                                                {externalLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Creando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                        Crear Cliente
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal para ingresar teléfono (opcional) */}
                {showPhoneModal && pendingCustomerData && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Cliente Encontrado
                            </h3>

                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm font-medium text-green-900">{pendingCustomerData.name}</p>
                                <p className="text-xs text-green-700 mt-1">
                                    {pendingCustomerData.document_type}: {pendingCustomerData.document_number}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="phone-input">Teléfono (Opcional)</Label>
                                    <Input
                                        id="phone-input"
                                        type="text"
                                        placeholder="Ingresa el teléfono del cliente"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        disabled={externalLoading}
                                        maxLength={15}
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Puedes dejar en blanco si no tienes el teléfono
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowPhoneModal(false);
                                            setPendingCustomerData(null);
                                            setPhoneNumber('');
                                        }}
                                        disabled={externalLoading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1"
                                        onClick={handleConfirmCreateWithPhone}
                                        disabled={externalLoading}
                                    >
                                        {externalLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Crear Cliente
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de selección de tamaño */}
                {showPrintSizeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-sm w-full">
                            {loading ? (
                                <div className="text-center py-6">
                                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary" />
                                    <h3 className="text-base font-semibold mb-1">Procesando Venta...</h3>
                                    <p className="text-sm text-muted-foreground">Por favor espera un momento</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-4">
                                        <h2 className="text-lg font-bold mb-1">Seleccionar Formato</h2>
                                        <p className="text-xs text-muted-foreground">Elige el tamaño del comprobante</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {/* A4 */}
                                        <button
                                            onClick={() => handlePrintSizeSelected('a4')}
                                            className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:scale-105"
                                        >
                                            <div className="mb-2 flex justify-center">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                                                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm mb-1">A4</div>
                                            <div className="text-xs text-muted-foreground font-medium">21 x 29.7 cm</div>
                                        </button>

                                        {/* A5 */}
                                        <button
                                            onClick={() => handlePrintSizeSelected('a5')}
                                            className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:scale-105"
                                        >
                                            <div className="mb-2 flex justify-center">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-colors">
                                                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm mb-1">A5</div>
                                            <div className="text-xs text-muted-foreground font-medium">14.8 x 21 cm</div>
                                        </button>

                                        {/* 80mm */}
                                        <button
                                            onClick={() => handlePrintSizeSelected('80mm')}
                                            className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:scale-105"
                                        >
                                            <div className="mb-2 flex justify-center">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition-colors">
                                                    <Receipt className="h-6 w-6 text-green-600 dark:text-green-400 stroke-[2.5]" />
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm mb-1">80mm</div>
                                            <div className="text-xs text-muted-foreground font-medium">8 cm ancho</div>
                                        </button>

                                        {/* 50mm */}
                                        <button
                                            onClick={() => handlePrintSizeSelected('50mm')}
                                            className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:scale-105"
                                        >
                                            <div className="mb-2 flex justify-center">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded group-hover:bg-amber-200 dark:group-hover:bg-amber-800/60 transition-colors">
                                                    <Receipt className="h-6 w-6 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm mb-1">50mm</div>
                                            <div className="text-xs text-muted-foreground font-medium">5 cm ancho</div>
                                        </button>
                                    </div>

                                    <Button
                                        onClick={() => setShowPrintSizeModal(false)}
                                        variant="outline"
                                        className="w-full"
                                        size="sm"
                                    >
                                        Cancelar
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal con PDF en iframe */}
                {showPdfModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className={`bg-white dark:bg-gray-900 rounded-lg flex flex-col ${
                            selectedPrintSize === 'a4' ? 'w-full max-w-4xl h-[95vh]' :
                            selectedPrintSize === 'a5' ? 'w-full max-w-2xl h-[90vh]' :
                            selectedPrintSize === '80mm' ? 'w-full max-w-md h-[85vh]' :
                            selectedPrintSize === '50mm' ? 'w-full max-w-sm h-[80vh]' :
                            'w-full max-w-4xl h-[90vh]'
                        }`}>
                            {/* Header */}
                            <div className="p-3 border-b dark:border-gray-700">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <h2 className="text-sm font-semibold">Venta Registrada - Comprobante</h2>
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const iframe = document.querySelector('iframe[title="Comprobante de Venta"]') as HTMLIFrameElement;
                                            if (iframe && iframe.contentWindow) {
                                                iframe.contentWindow.print();
                                            }
                                        }}
                                    >
                                        <Printer className="h-3 w-3 mr-1.5" />
                                        Imprimir
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowPdfModal(false);
                                            window.location.href = '/sales/create';
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1.5" />
                                        Nueva Venta
                                    </Button>
                                </div>
                            </div>

                            {/* PDF iframe */}
                            <div className="flex-1 overflow-hidden p-3">
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full border border-gray-200 dark:border-gray-700 rounded"
                                    title="Comprobante de Venta"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}