import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hiring',
  templateUrl: './hiring.component.html',
  styleUrls: ['./hiring.component.css']
})
export class HiringComponent {
  jobs: any[] = [];
   constructor(private http: HttpClient) {}

   
  ngOnInit(): void {
    this.http.get<any[]>('assets/hiring.json').subscribe(data => {
      this.jobs = data;
    });
  }

  expandedIndex: number | null = null;

  toggleDescription(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
