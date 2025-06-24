import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-wishcard',
  templateUrl: './wishcard.component.html',
  styleUrls: ['./wishcard.component.css']
})
export class WishcardComponent implements OnInit {
  allWishes: any[] = [];
  today = new Date();

  onboardingWishes: any[] = [];
  birthdayWishes: any[] = [];
  anniversaryWishes: any[] = [];

  onboardingIndex = 0;
  birthdayIndex = 0;
  anniversaryIndex = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('assets/wishes.json').subscribe(data => {
      this.allWishes = data;
      this.filterWishes();
    });
  }

  filterWishes() {
    const todayDay = this.today.getDate();
    const todayMonth = this.today.toLocaleString('default', { month: 'short' });

    this.onboardingWishes = this.allWishes
      .filter(p => p.category === 'WELCOME ON BOARD')
      .slice(0, 10);

    this.birthdayWishes = this.allWishes
      .filter(p => {
        if (p.category !== 'BIRTHDAY WISHES') return false;
        const parts = p.date.trim().split(' ');
        if (parts.length < 2) return false;
        const day = parseInt(parts[0]);
        const month = parts[1];
        return day === todayDay && month.toLowerCase() === todayMonth.toLowerCase();
      })
      .slice(0, 15);

    this.anniversaryWishes = this.allWishes
      .filter(p => {
        if (p.category !== 'ANNIVERSARY WISHES') return false;
        const match = p.date.match(/(\d{1,2}) (\w{3})/);
        if (!match) return false;
        const day = parseInt(match[1]);
        const month = match[2];
        return day === todayDay && month.toLowerCase() === todayMonth.toLowerCase();
      })
      .slice(0, 10);
  }

  sendWishes(name: string) {
    Swal.fire({
      title: 'Wishes Sent!',
      text: `You have sent wishes to ${name}.`,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  }

  next(category: string) {
    switch (category) {
      case 'WELCOME ON BOARD':
        if (this.onboardingWishes.length > 0) {
          this.onboardingIndex = (this.onboardingIndex + 1) % this.onboardingWishes.length;
        }
        break;
      case 'BIRTHDAY WISHES':
        if (this.birthdayWishes.length > 0) {
          this.birthdayIndex = (this.birthdayIndex + 1) % this.birthdayWishes.length;
        }
        break;
      case 'ANNIVERSARY WISHES':
        if (this.anniversaryWishes.length > 0) {
          this.anniversaryIndex = (this.anniversaryIndex + 1) % this.anniversaryWishes.length;
        }
        break;
    }
  }

  previous(category: string) {
    switch (category) {
      case 'WELCOME ON BOARD':
        if (this.onboardingWishes.length > 0) {
          this.onboardingIndex = (this.onboardingIndex - 1 + this.onboardingWishes.length) % this.onboardingWishes.length;
        }
        break;
      case 'BIRTHDAY WISHES':
        if (this.birthdayWishes.length > 0) {
          this.birthdayIndex = (this.birthdayIndex - 1 + this.birthdayWishes.length) % this.birthdayWishes.length;
        }
        break;
      case 'ANNIVERSARY WISHES':
        if (this.anniversaryWishes.length > 0) {
          this.anniversaryIndex = (this.anniversaryIndex - 1 + this.anniversaryWishes.length) % this.anniversaryWishes.length;
        }
        break;
    }
  }

  getCurrentCard(category: string) {
    switch (category) {
      case 'WELCOME ON BOARD':
        return this.onboardingWishes[this.onboardingIndex];
      case 'BIRTHDAY WISHES':
        return this.birthdayWishes[this.birthdayIndex];
      case 'ANNIVERSARY WISHES':
        return this.anniversaryWishes[this.anniversaryIndex];
      default:
        return null;
    }
  }
}
