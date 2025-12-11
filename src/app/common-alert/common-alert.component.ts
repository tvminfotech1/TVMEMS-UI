import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

@Component({
  selector: 'app-common-alert',
  templateUrl: './common-alert.component.html',
  styleUrls: ['./common-alert.component.css']
})
export class CommonAlertComponent implements OnChanges {

@Input() visible = false;
  @Input() type: AlertType = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() autoClose = 0;
  @Output() confirmed = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      this.openSweetAlert();
    }
  }

  private openSweetAlert() {
    const swalOptions: any = {
      title: this.title,
      text: this.message,
      icon: this.type === 'confirm' ? 'question' : this.type,
      showConfirmButton: true
    };

    if (this.type !== 'confirm' && this.autoClose > 0) {
      swalOptions.timer = this.autoClose;
      swalOptions.timerProgressBar = true;
    }

    if (this.type === 'confirm') {
      swalOptions.showCancelButton = true;
      swalOptions.confirmButtonText = "Yes";
      swalOptions.cancelButtonText = "No";
    }

    Swal.fire(swalOptions).then(result => {
      if (this.type === 'confirm') {
        this.confirmed.emit(result.isConfirmed);
      }
      this.visible = false;
    });
  }

}
