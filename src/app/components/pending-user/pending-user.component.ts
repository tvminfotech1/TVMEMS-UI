import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pending-user',
  templateUrl: './pending-user.component.html',
  styleUrls: ['./pending-user.component.css']
})
export class PendingUserComponent {
  searchTerm: string = '';
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<{ message: string, body: any[], statusCode: number }>('http://localhost:8080/personal/pendingEmp')
      .subscribe((data) => {
        console.log(data);
        
        this.users = data.body.map((user: any) => ({
          ...user,
          // status: this.checkIfFormSubmitted(user) 'Pending'
        }));
      });
  }

  checkIfFormSubmitted(user: any): boolean {
    return user.fullName && user.mobile && user.aadhar && user.dob && user.gender;
  }

  filteredUsers() {
    return this.users.filter(user =>
      (user.fullName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
