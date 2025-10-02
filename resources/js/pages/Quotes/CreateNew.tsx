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
import {
    ArrowLeft,
    Plus,
    Trash2,
    ShoppingCart,
    Package,
    User,
    List,
    DollarSign,
    Search,
    UserPlus,
    Loader2,
    CheckCircle,
    Minus,
    XCircle,
    AlertTriangle,
    FileText,
    Calculator,
    Calendar
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';
import ProductSelectorModal from '@/components/ProductSelectorModal';
import axios from 'axios';

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

interface QuoteDetail {
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
}

interface QuotesCreateProps {
    defaultBranchId?: number;
    customers: Customer[];
    branches: Branch[];
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cotizaciones', href: '/quotes' },
    { title: 'Nueva Cotización', href: '#' },
];
