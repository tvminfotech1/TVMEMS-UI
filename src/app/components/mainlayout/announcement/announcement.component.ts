import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('assets/announcement-data.json').subscribe(data => {
      this.announcements = data.announcements;
    });
  }

  

  changePage(page: number) {
    this.currentPage = page;
  }

  openCalendar(announcement: any) {
    console.log('Calendar clicked for:', announcement);
  }

  switchTab(tab: 'notification' | 'announcement') {
    this.currentTab = tab;
  }
}
