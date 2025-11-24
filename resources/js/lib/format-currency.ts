/**
 * Formatea un número como moneda peruana (Soles)
 * @param amount - Cantidad a formatear
 * @returns String formateado como "S/ 1,234.56"
 */
export function formatCurrency(amount: number): string {
    return 'S/ ' + new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
