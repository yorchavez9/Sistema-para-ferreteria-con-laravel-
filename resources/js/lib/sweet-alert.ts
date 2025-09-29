import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// Configuración por defecto para el tema
const defaultSwalConfig = {
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    content: 'swal-content',
    confirmButton: 'swal-confirm-btn',
    cancelButton: 'swal-cancel-btn',
  },
  buttonsStyling: false,
}

// Alert de confirmación para eliminar
export const confirmDelete = async (title: string, text?: string) => {
  return MySwal.fire({
    ...defaultSwalConfig,
    title: title,
    text: text || '¡No podrás revertir esta acción!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    focusCancel: true,
  })
}

// Alert de éxito
export const showSuccess = (title: string, text?: string) => {
  return MySwal.fire({
    ...defaultSwalConfig,
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'Aceptar',
  })
}

// Alert de error
export const showError = (title: string, text?: string) => {
  return MySwal.fire({
    ...defaultSwalConfig,
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'Aceptar',
  })
}

// Alert de información
export const showInfo = (title: string, text?: string) => {
  return MySwal.fire({
    ...defaultSwalConfig,
    title: title,
    text: text,
    icon: 'info',
    confirmButtonText: 'Aceptar',
  })
}

export { MySwal }