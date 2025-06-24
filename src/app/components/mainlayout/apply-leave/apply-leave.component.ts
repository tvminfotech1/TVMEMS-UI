import { Component } from '@angular/core';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.css']
})
export class ApplyLeaveComponent {
  leave = {
    leaveType: '',
    from: '',
    fromType: 'full',
    to: '',
    toType: 'full',
    comments: '',
    notifyTo: ''
  };

  onSubmit() {
    console.log('Leave Application Submitted:', this.leave);
    alert('Leave Application Submitted!');
    // Reset form values
    this.leave = {
      leaveType: '',
      from: '',
      fromType: 'full',
      to: '',
      toType: 'full',
      comments: '',
      notifyTo: ''
    };
  }
}
