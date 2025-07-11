import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../user-service.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  userData: any;
  employeeId!: number;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
     this.userData = {
      fname: 'Rohit',
      mname: 'Kumar',
      lname: 'Singh',
      email: 'rohit@example.com',
      employeeId : 12345,
      gender: 'Male',
      bloodGroup: 'O+',
      dob: '27/12/2003',
      merital: 'Single',
      marriegedate: 'NA',

      current_address: 'Sector 22, Noida',
      current_city: 'Noida',
      current_state: 'Uttar Pradesh',
      current_country: 'India',
      current_contact: '9876543210',

      emergency_contact_name: 'Amit Kumar',
      emergency_contact_number: '9876543211',

      exp_year: '2',
      exp_month: '6',
      relevantYear: '2'
    };
    this.route.params.subscribe(params => {
      this.employeeId = params['id'];
      this.fetchEmployeeDetails(this.employeeId);
    });
  }

  fetchEmployeeDetails(id: number): void {
    this.http.get<any>('http://localhost:8080/personal').subscribe((res) => {
      const data = res.body;
      this.userData = data.find((emp: any) => emp.id == id);
    });
  }
}
