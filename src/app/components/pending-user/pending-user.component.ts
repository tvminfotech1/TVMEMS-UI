import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from 'src/app/services/auth.service';
import { PendingUserService } from 'src/app/services/pending-user.service';

@Component({
  selector: 'app-pending-user',
  templateUrl: './pending-user.component.html',
  styleUrls: ['./pending-user.component.css']
})
export class PendingUserComponent {
  searchText: string = '';
  details: any[] = [];
  filteredUser:any[]=[];
  isAdmin = false;



  constructor(
    private authservice: AuthService,
    private pendingUserService: PendingUserService
  ) {}

  ngOnInit(): void {

     this.isAdmin = this.authservice.isAdmin();
    if (this.isAdmin) {
      this.fetchPendingUsers();
    }

  }

  fetchPendingUsers(){
    this.pendingUserService.getUserPending().subscribe({
      next:(response)=>{
        this.details= response.body || [];
        console.log('pending user request :', this.details);
      },
      error:(err)=>{
        console.error('error fetching pending users:',err);
        this.details=[];
      }
    });
  }
  

  get filteredUsers() {
    if(!this.searchText) return this.details;
    return this.details.filter(req=>
      req.fullName ?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      req.email ?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      req.aadhar?.includes(this.searchText)
    );
  }


}
