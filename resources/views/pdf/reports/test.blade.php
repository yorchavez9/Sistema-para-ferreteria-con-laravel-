@extends('pdf.layouts.base')

@section('content')
<div class="summary-box">
    <div class="summary-title">REPORTE DE PRUEBA</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Sistema:</div>
            <div class="summary-value highlight">Sistema de Ferretería</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Versión:</div>
            <div class="summary-value">1.0</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Estado:</div>
            <div class="summary-value"><span class="badge badge-success">Funcionando</span></div>
        </div>
    </div>
</div>

<h2>Tabla de Ejemplo</h2>

<table class="table-bordered">
    <thead>
        <tr>
            <th>#</th>
            <th>Descripción</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Precio</th>
            <th class="text-right">Total</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>Producto de Prueba 1</td>
            <td class="text-right">10</td>
            <td class="text-right currency">S/ 25.50</td>
            <td class="text-right currency">S/ 255.00</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Producto de Prueba 2</td>
            <td class="text-right">5</td>
            <td class="text-right currency">S/ 100.00</td>
            <td class="text-right currency">S/ 500.00</td>
        </tr>
        <tr>
            <td>3</td>
            <td>Producto de Prueba 3</td>
            <td class="text-right">8</td>
            <td class="text-right currency">S/ 15.75</td>
            <td class="text-right currency">S/ 126.00</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4" class="text-right">TOTAL:</td>
            <td class="text-right currency">S/ 881.00</td>
        </tr>
    </tfoot>
</table>

<div class="alert alert-info mt-15">
    <strong>Nota:</strong> Este es un reporte de prueba para verificar que el sistema de generación de PDFs funciona correctamente.
</div>

<div class="grid-2 mt-20">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Información Adicional</div>
            <div class="info-box-content">
                <div class="info-row">
                    <span class="info-label">Módulo:</span>
                    <span class="info-value">Reportes</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tipo:</span>
                    <span class="info-value">PDF Prueba</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Framework:</span>
                    <span class="info-value">DomPDF</span>
                </div>
            </div>
        </div>
    </div>
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Estados de Prueba</div>
            <div class="info-box-content">
                <div class="info-row">
                    <span class="badge badge-success">Activo</span>
                    <span class="badge badge-warning">Pendiente</span>
                    <span class="badge badge-danger">Cancelado</span>
                </div>
                <div class="info-row mt-10">
                    <span class="text-success">Stock Normal</span> |
                    <span class="text-warning">Stock Bajo</span> |
                    <span class="text-danger">Agotado</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
