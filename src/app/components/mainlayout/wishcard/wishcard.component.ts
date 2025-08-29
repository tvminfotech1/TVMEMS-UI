import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-wishcard',
  templateUrl: './wishcard.component.html',
  styleUrls: ['./wishcard.component.css']
})
export class WishcardComponent implements OnInit {
  // ✅ Define category constants
  readonly CATEGORY_ONBOARDING = 'WELCOME ON BOARD';
  readonly CATEGORY_BIRTHDAY = 'BIRTHDAY WISHES';
  readonly CATEGORY_ANNIVERSARY = 'ANNIVERSARY WISHES';

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
    this.http.get<any[]>('http://localhost:8080/personal/wishes').subscribe(data => {
      this.allWishes = data;
      this.filterWishes();
    });
  }

  filterWishes() {
    const todayDay = this.today.getDate();
    const todayMonth = this.today.toLocaleString('default', { month: 'short' });

    this.onboardingWishes = this.allWishes
      .filter(p => p.category === this.CATEGORY_ONBOARDING)
      .slice(0, 10);

    this.birthdayWishes = this.allWishes
      .filter(p => {
        if (p.category !== this.CATEGORY_BIRTHDAY) return false;
        const parts = p.date?.trim().split(' ');
        if (!parts || parts.length < 2) return false;
        const day = parseInt(parts[0]);
        const month = parts[1];
        return day === todayDay && month.toLowerCase() === todayMonth.toLowerCase();
      })
      .slice(0, 15);

    this.anniversaryWishes = this.allWishes
      .filter(p => {
        if (p.category !== this.CATEGORY_ANNIVERSARY) return false;
        const match = p.date?.match(/(\d{1,2}) (\w{3})/);
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
      case this.CATEGORY_ONBOARDING:
        if (this.onboardingWishes.length > 0) {
          this.onboardingIndex = (this.onboardingIndex + 1) % this.onboardingWishes.length;
        }
        break;
      case this.CATEGORY_BIRTHDAY:
        if (this.birthdayWishes.length > 0) {
          this.birthdayIndex = (this.birthdayIndex + 1) % this.birthdayWishes.length;
        }
        break;
      case this.CATEGORY_ANNIVERSARY:
        if (this.anniversaryWishes.length > 0) {
          this.anniversaryIndex = (this.anniversaryIndex + 1) % this.anniversaryWishes.length;
        }
        break;
    }
  }

  previous(category: string) {
    switch (category) {
      case this.CATEGORY_ONBOARDING:
        if (this.onboardingWishes.length > 0) {
          this.onboardingIndex = (this.onboardingIndex - 1 + this.onboardingWishes.length) % this.onboardingWishes.length;
        }
        break;
      case this.CATEGORY_BIRTHDAY:
        if (this.birthdayWishes.length > 0) {
          this.birthdayIndex = (this.birthdayIndex - 1 + this.birthdayWishes.length) % this.birthdayWishes.length;
        }
        break;
      case this.CATEGORY_ANNIVERSARY:
        if (this.anniversaryWishes.length > 0) {
          this.anniversaryIndex = (this.anniversaryIndex - 1 + this.anniversaryWishes.length) % this.anniversaryWishes.length;
        }
        break;
    }
  }

  getCurrentCard(category: string) {
    switch (category) {
      case this.CATEGORY_ONBOARDING:
        return this.onboardingWishes[this.onboardingIndex];
      case this.CATEGORY_BIRTHDAY:
        return this.birthdayWishes[this.birthdayIndex];
      case this.CATEGORY_ANNIVERSARY:
        return this.anniversaryWishes[this.anniversaryIndex];
      default:
        return null;
    }
  }
}
