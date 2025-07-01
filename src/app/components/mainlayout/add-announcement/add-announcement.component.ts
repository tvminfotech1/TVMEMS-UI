import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css']
})
export class AddAnnouncementComponent {
  announcementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      announceStartDate: ['', Validators.required],
      announceEndDate: ['', Validators.required],
      description: ['']
    });
  }

  submitForm() {
    if (this.announcementForm.valid) {
      const announcementData = this.announcementForm.value;

      this.http.post('http://localhost:3000/announcements', announcementData).subscribe({
        next: () => {
          alert('Announcement added successfully!');
          this.router.navigate(['/mainlayout/announcement']);
        },
        error: (err) => {
          console.error('Error adding announcement:', err);
          alert('Failed to add announcement.');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/mainlayout/announcement']);
  }
}
