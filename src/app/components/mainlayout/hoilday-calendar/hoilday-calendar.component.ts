import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
interface Holiday {
  id: number;
  name: string;
  date: string;
  day_Name: string;
}
@Component({
  selector: 'app-hoilday-calendar',
  templateUrl: './hoilday-calendar.component.html',
  styleUrls: ['./hoilday-calendar.component.css'],
})
export class HolidayCalendarComponent implements OnInit {
  holidays: Holiday[] = [];
  isLoading = true;
  errorMessage = '';

  private apiUrl = 'http://localhost:8080/Holiday';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.http.get<Holiday[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.holidays = data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching holidays:', error);
        this.errorMessage = 'Failed to load holidays. Please try again later.';
        this.isLoading = false;
      },
    });
  }
}
