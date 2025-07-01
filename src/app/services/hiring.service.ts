import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HiringService {

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
