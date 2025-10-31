import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserDetailsService } from 'src/app/services/userDetails.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent implements OnInit {
  userData: any = {};
  employeeId: number | null = null;
  email: string | null = null;
  fullName: string | null = null;
  userDetails!: FormGroup;

  constructor(private authService: AuthService, private fb: FormBuilder, private userDetailsService : UserDetailsService) {}
  
  ngOnInit(): void {
    this.employeeId = this.getEmployeeIdFromToken();
    this.email = this.authService.getEmailFromToken();
    this.fullName = this.authService.getfullName()?.toUpperCase() || null;

   // Subscribe to getformData observable
  this.userDetailsService.getformData().subscribe(
    (data: any) => {
      // Now data contains the full JSON, we can patch the form
      this.userDetails = this.fb.group({
        personal: this.fb.group({
          fname: [data.personal?.fname || ''],
          mname: [data.personal?.mname || ''],
          lname: [data.personal?.lname || ''],
          email: [data.personal?.email || ''],
          gender: [data.personal?.gender || ''],
          bloodGroup: [data.personal?.bloodGroup || ''],
          dob: [data.personal?.dob || ''],
          marital: [data.personal?.marital || ''],
          marriegedate: [data.personal?.marriegedate || ''],
          current_address: [data.personal?.current_address || ''],
          current_country: [data.personal?.current_country || ''],
          current_state: [data.personal?.current_state || ''],
          current_city: [data.personal?.current_city || ''],
          current_pincode: [data.personal?.current_pincode || ''],
          current_contact: [data.personal?.current_contact || ''],
          permanent_address: [data.personal?.permanent_address || ''],
          permanent_country: [data.personal?.permanent_country || ''],
          permanent_state: [data.personal?.permanent_state || ''],
          permanent_city: [data.personal?.permanent_city || ''],
          permanent_pincode: [data.personal?.permanent_pincode || ''],
          permanent_contact: [data.personal?.permanent_contact || ''],
          bcp_address: [data.personal?.bcp_address || ''],
          bcp_country: [data.personal?.bcp_country || ''],
          bcp_state: [data.personal?.bcp_state || ''],
          bcp_city: [data.personal?.bcp_city || ''],
          bcp_pincode: [data.personal?.bcp_pincode || ''],
          emergency_contact_name: [data.personal?.emergency_contact_name || ''],
          emergency_contact_number: [data.personal?.emergency_contact_number || ''],
          emergency_relationship: [data.personal?.emergency_relationship || ''],
          exp_year: [data.personal?.exp_year || 0],
          exp_month: [data.personal?.exp_month || 0],
          relevantYear: [data.personal?.relevantYear || 0],
          copyAddressChecked: [data.personal?.copyAddressChecked || false],
        }),
        kyc: this.fb.group({
          pan: [data.kyc?.pan || ''],
          panName: [data.kyc?.panName || ''],
          aadhar: [data.kyc?.aadhar || ''],
          aadharName: [data.kyc?.aadharName || ''],
          uan: [data.kyc?.uan || ''],
          pf: [data.kyc?.pf || ''],
          hdfc: [data.kyc?.hdfc || ''],
        }),
        passport: this.fb.group({
          nationality: [data.passport?.nationality || ''],
          ifPassport: [data.passport?.ifPassport || ''],
          passportNumber: [data.passport?.passportNumber || ''],
        }),
        family: this.fb.group({
          fatherName: [data.family?.fatherName || ''],
          fatherDOB: [data.family?.fatherDOB || ''],
          motherName: [data.family?.motherName || ''],
          motherDOB: [data.family?.motherDOB || ''],
          spouseName: [data.family?.spouseName || ''],
          spouseDOB: [data.family?.spouseDOB || ''],
          spouseGender: [data.family?.spouseGender || ''],
          children: [data.family?.children || ''],
        }),
        previousEmployment: this.fb.array(data.previousEmployment || []),
        education: this.fb.group({
          qualification: [data.education?.qualification || ''],
          specilization: [data.education?.specilization || ''],
          instituteName: [data.education?.instituteName || ''],
          universityName: [data.education?.universityName || ''],
          time: [data.education?.time || ''],
          fromDate: [data.education?.fromDate || ''],
          toDate: [data.education?.toDate || ''],
          percentage: [data.education?.percentage || 0],
          rollNo: [data.education?.rollNo || ''],
          educationType: [data.education?.educationType || ''],
        }),
        skills: this.fb.array(data.skills || []),
        certification: this.fb.array(data.certification || []),
        resume: this.fb.group({
          achievements: [data.resume?.achievements || ''],
          resumeCate: [data.resume?.resumeCate || ''],
        })
      });
    },
    (err) => {
      console.error('Error fetching user details:', err);
    }
  );
  }

  getEmployeeIdFromToken(): number | null {
    const empIdStr = this.authService.getEmployeeId();
    return empIdStr ? Number(empIdStr) : null;
  }
}
