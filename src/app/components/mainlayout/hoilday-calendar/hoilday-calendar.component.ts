import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hoilday-calendar',
  templateUrl: './hoilday-calendar.component.html',
  styleUrls: ['./hoilday-calendar.component.css']
})
export class HoildayCalendarComponent implements OnInit {
  holidays: any[] = [];

  private apiUrl = 'http://localhost:8080/Holiday';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.holidays = data;
    });
  }
}
