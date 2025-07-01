import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {

  currentTab: 'notification' | 'announcement' = 'announcement';
  currentPage = 1;
  announcements: any[] = [];

  get visibleAnnouncements() {
    const pageSize = 10;
    const start = (this.currentPage - 1) * pageSize;
    return this.announcements.slice(start, start + pageSize);
  }

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchAnnouncements();
  }

  fetchAnnouncements(): void {
    this.http.get<any>('http://localhost:8080/api/announcements').subscribe({
      next: (response) => {
        this.announcements = response.announcements || response;
      },
      error: (err) => {
        console.error('Failed to fetch announcements:', err);
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openCalendar(announcement: any): void {
    console.log('Calendar clicked for:', announcement);
  }

  switchTab(tab: 'notification' | 'announcement'): void {
    this.currentTab = tab;
  }

  onAddAnnouncement(): void {
    console.log('Add Announcement clicked');
    this.router.navigate(['/mainlayout/add-announcement']);
  }
}
