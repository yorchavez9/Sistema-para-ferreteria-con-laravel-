/**
 * Sistema de Diseño Estandarizado - Ferretería
 * Configuración centralizada para tipografías, espaciados y estilos
 */

export const typography = {
  // Títulos de Página
  pageTitle: 'text-2xl font-bold tracking-tight',
  pageSubtitle: 'text-sm text-muted-foreground',

  // Títulos de Sección/Card
  sectionTitle: 'text-lg font-semibold',
  cardTitle: 'text-base font-semibold',

  // Estadísticas
  statLabel: 'text-xs text-muted-foreground uppercase font-medium tracking-wide',
  statValue: 'text-2xl font-bold mt-1',
  statSubValue: 'text-xs text-muted-foreground mt-0.5',

  // Tablas
  tableHeader: 'text-xs font-medium uppercase tracking-wide',
  tableCell: 'text-sm',
  tableCellMono: 'text-sm font-mono',
  tableCellBold: 'text-sm font-semibold',

  // Formularios
  formLabel: 'text-sm font-medium',
  formHelper: 'text-xs text-muted-foreground',
  formError: 'text-xs text-destructive',

  // General
  body: 'text-sm',
  small: 'text-xs',
  tiny: 'text-[10px]',

  // Links
  link: 'text-sm text-primary hover:underline font-medium',
} as const;

export const spacing = {
  // Padding de contenedores principales
  pageContainer: 'p-4 sm:p-6',
  cardPadding: 'p-6',
  cardPaddingCompact: 'p-4',

  // Espaciado vertical entre secciones
  sectionGap: 'space-y-6',
  sectionGapCompact: 'space-y-4',

  // Gaps en grids
  gridGap: 'gap-4',
  gridGapCompact: 'gap-3',

  // Padding de inputs
  inputPadding: 'px-3 py-2',
} as const;

export const buttons = {
  sizes: {
    sm: 'h-8 px-3 text-xs',
    default: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-sm',
  },
  iconSizes: {
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  },
} as const;

export const cards = {
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  interactive: 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow',
  stat: 'rounded-lg border bg-card text-card-foreground shadow-sm',
} as const;

export const badges = {
  status: {
    active: 'bg-green-100 text-green-800 border-green-300',
    inactive: 'bg-gray-100 text-gray-800 border-gray-300',
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  },
  size: {
    sm: 'text-[10px] px-2 py-0.5',
    default: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  },
} as const;

export const tables = {
  container: 'rounded-lg border bg-card overflow-hidden',
  header: 'bg-muted/50',
  row: 'hover:bg-muted/50 transition-colors',
  rowExpanded: 'bg-muted/30',
  cell: 'px-4 py-3',
  cellCompact: 'px-3 py-2',

  // Responsive
  hideOnMobile: 'hidden md:table-cell',
  showOnMobile: 'md:hidden',
} as const;

export const inputs = {
  base: 'h-9 text-sm',
  sm: 'h-8 text-xs',
  lg: 'h-10 text-sm',
} as const;

export const animations = {
  transition: 'transition-all duration-200 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
} as const;

export const responsive = {
  // Breakpoints (siguiendo Tailwind)
  breakpoints: {
    sm: '640px',  // móvil grande
    md: '768px',  // tablet
    lg: '1024px', // desktop
    xl: '1280px', // desktop grande
  },

  // Grids responsivos comunes
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 sm:grid-cols-2',
    cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    cols6: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  },
} as const;

/**
 * Helper para combinar clases del sistema de diseño
 */
export function designClass(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Íconos estándar por tamaño
 */
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  default: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
} as const;

/**
 * Colores semánticos del sistema
 * Usar variables CSS en lugar de colores hardcodeados
 */
export const colors = {
  // Estados
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  info: 'text-blue-600',

  // Backgrounds
  successBg: 'bg-green-50 border-green-200',
  warningBg: 'bg-amber-50 border-amber-200',
  errorBg: 'bg-red-50 border-red-200',
  infoBg: 'bg-blue-50 border-blue-200',
} as const;
