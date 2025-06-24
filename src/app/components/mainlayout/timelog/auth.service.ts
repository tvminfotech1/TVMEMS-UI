import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  getAuthenticatedEmployee() {
    // Replace with real authentication logic
    return { employeeName: 'John Doe' };
  }

}