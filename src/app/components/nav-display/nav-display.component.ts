import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nav-display',
  templateUrl: './nav-display.component.html',
  styleUrls: ['./nav-display.component.css']
})
export class NavDisplayComponent implements OnInit {
  employeeId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
  }

  navigateTo(path: string): void {
    if (this.employeeId) {
      this.router.navigate([`/mainlayout/${path}`, this.employeeId]);
    }
  }
  isActive(tab: string): boolean {
  return this.router.url.includes(`/mainlayout/${tab}`);
}

}
