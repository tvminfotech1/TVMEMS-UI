import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {

  showSuccess(message: string, title = 'Success') {
    Swal.fire({ icon: 'success', title, text: message });
  }

  showError(message: string, title = 'Error') {
    Swal.fire({ icon: 'error', title, text: message });
  }

  showWarning(message: string, title = 'Warning') {
    Swal.fire({ icon: 'warning', title, text: message });
  }
  showalert(message: string, title = 'Alert') {
  Swal.fire({ icon: 'warning', title, text: message });
  }

  showInfo(message: string, title = 'Info') {
    Swal.fire({ icon: 'info', title, text: message });
  }

  showConfirm(message: string, title = 'Are you sure?') {
    return Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });
  }
}
