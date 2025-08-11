import Swal from 'sweetalert2';

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