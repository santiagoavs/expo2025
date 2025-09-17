import Swal from 'sweetalert2';

// Configuración global de SweetAlert2 con z-index alto
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '1500';
    }
  }
});

export const showSuccess = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#086788',
    timer: 3000
  });
};

export const showError = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#086788'
  });
};

export const showWarning = (title, text) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#086788'
  });
};

export const showInfo = (title, text) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: '#086788'
  });
};