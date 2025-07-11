import Swal from 'sweetalert2';

// Configuración base para todas las alertas
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// Alertas principales
export const showSuccess = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#086788',
    timer: 2000,
    showConfirmButton: false
  });
};

export const showError = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#086788'
  });
};

// Toasts para notificaciones menos intrusivas
export const showSuccessToast = (title) => {
  return Toast.fire({
    icon: 'success',
    title
  });
};

export const showErrorToast = (title) => {
  return Toast.fire({
    icon: 'error',
    title
  });
};

// Confirmación
export const showConfirm = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#086788',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  });
};

// Loading
export const showLoading = (title = 'Procesando...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};