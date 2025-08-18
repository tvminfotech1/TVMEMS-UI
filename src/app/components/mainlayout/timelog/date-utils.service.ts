import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateUtilsService {
  getAllMondaysOfMonth(year: number, monthIndex: number): string[] {
    const mondays: string[] = [];
    const date = new Date(year, monthIndex, 1);
    while (date.getMonth() === monthIndex) {
      if (date.getDay() === 1) {
        mondays.push(date.toISOString().split('T')[0]);
      }
      date.setDate(date.getDate() + 1);
    }
    return mondays;
  }

  getCurrentMondayISO(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }
}
