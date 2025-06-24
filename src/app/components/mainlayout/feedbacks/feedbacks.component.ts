import { Component } from '@angular/core';

@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent {
 feedbacks = [
    // Uncomment below to test dynamic data
    { description: 'Great work environment', status: 'Reviewed' },
    { description: 'Need better internet', status: 'Pending' }
  ];
}
