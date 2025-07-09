import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PersonalComponent } from './components/personal/personal.component';
import { KycComponent } from './components/kyc/kyc.component';
import { PassportVisaComponent } from './components/passport-visa/passport-visa.component';
import { FamilyComponent } from './components/family/family.component';
import { EducationComponent } from './components/education/education.component';
import { SkillsComponent } from './components/skills/skills.component';
import { CertificateComponent } from './components/certificate/certificate.component';
import { DocumentComponent } from './components/document/document.component';
import { ResumeComponent } from './components/resume/resume.component';
import { FinalComponent } from './components/final/final.component';
import { PreviousEmploymentComponent } from './components/previous-employment/previous-employment.component';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { EmployeeDataComponent } from './components/employee-data/employee-data.component';
import { LoginByNumberComponent } from './components/login-by-number/login-by-number.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { PendingUserComponent } from './components/pending-user/pending-user.component';
import { TimeSheetComponent } from './components/time-sheet/time-sheet.component';
import { TimeSheetViewComponent } from './components/time-sheet/time-sheet-view/time-sheet-view.component';

// Employee details component
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { EmpkycComponent } from './components/employee-details/empkyc/empkyc.component';
import { EmppassportComponent } from './components/employee-details/emppassport/emppassport.component';
import { EmpfamilyComponent } from './components/employee-details/empfamily/empfamily.component';
import { EmppreviousEmployeeComponent } from './components/employee-details/empprevious-employee/empprevious-employee.component';
import { EmpeducationComponent } from './components/employee-details/empeducation/empeducation.component';
import { EmpskillsComponent } from './components/employee-details/empskills/empskills.component';
import { EmpcertificateComponent } from './components/employee-details/empcertificate/empcertificate.component';
import { EmpdocumentComponent } from './components/employee-details/empdocument/empdocument.component';
import { EmpresumeComponent } from './components/employee-details/empresume/empresume.component';
import { EmpfinalComponent } from './components/employee-details/empfinal/empfinal.component';

// Main layout and dashboard routes
import { MainlayoutComponent } from './components/mainlayout/mainlayout.component';
import { DashboardhomeComponent } from './components/mainlayout/dashboardhome/dashboardhome.component';
import { HoildayCalendarComponent } from './components/mainlayout/hoilday-calendar/hoilday-calendar.component';
import { FeedbacksComponent } from './components/mainlayout/feedbacks/feedbacks.component';
import { WorkhoursComponent } from './components/mainlayout/workhours/workhours.component';
import { HiringComponent } from './components/mainlayout/hiring/hiring.component';
import { WorkHistoryComponent } from './components/mainlayout/work-history/work-history.component';
import { WishcardComponent } from './components/mainlayout/wishcard/wishcard.component';
import { AnnouncementComponent } from './components/mainlayout/announcement/announcement.component';
import { ApplyLeaveComponent } from './components/mainlayout/apply-leave/apply-leave.component';
import { LeaveComponent } from './components/mainlayout/leave/leave.component';
import { WorkfromhomeComponent } from './components/mainlayout/workfromhome/workfromhome.component';
import { TimelogComponent } from './components/mainlayout/timelog/timelog.component';
import { TaskComponent } from './components/mainlayout/task/task.component';
import { ResignationComponent } from './components/mainlayout/resignation/resignation.component';
import { OkrComponent } from './components/mainlayout/okr/okr.component';
import { AttendanceComponent } from './components/mainlayout/attendance/attendance.component';
import { OrganizationComponent } from './components/mainlayout/organization/organization.component';
import { AddOpeningComponent } from './components/mainlayout/addopening/addopening.component';
import { GoalComponent } from './components/mainlayout/goal/goal.component';
import { DashboardComponent } from './components/payroll/dashboard/dashboard.component';
import { AddEmployeeComponent } from './components/payroll/add-employee/add-employee.component';
import { PayrollEmployeeComponent } from './components/payroll/payroll-employee/payroll-employee.component';
import { EmployeeViewComponent } from './components/payroll/employee-view/employee-view.component';
import { PayrunsComponent } from './components/payroll/payruns/payruns.component';
import { AddSalaryComponent } from './components/payroll/add-salary/add-salary.component';
import { MonthlySalarySlipComponent } from './components/payroll/monthly-salary-slip/monthly-salary-slip.component';
import { ReportComponent } from './components/payroll/report/report.component';
import { YearlySalarySlipComponent } from './components/payroll/yearly-salary-slip/yearly-salary-slip.component';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { userAuthGuard } from './guards/user-auth.guard';


import { AddAnnouncementComponent } from './components/mainlayout/add-announcement/add-announcement.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'personal', component: PersonalComponent },
  // { path: 'kyc', component: KycComponent },
  // { path: 'passport', component: PassportVisaComponent },
  // { path: 'family', component: FamilyComponent },
  // { path: 'previousEmployee', component: PreviousEmploymentComponent },
  // { path: 'education', component: EducationComponent },
  // { path: 'skills', component: SkillsComponent },
  // { path: 'certificate', component: CertificateComponent },
  // { path: 'document', component: DocumentComponent },
  // { path: 'resume', component: ResumeComponent },
  // { path: 'final', component: FinalComponent },

  { path: 'login', component: LoginComponent },
  { path: 'loginByNumber', component: LoginByNumberComponent },
  
  { path: 'admin', component: AdminComponent },
  { path: 'adminLogin', component: AdminLoginComponent},
  { path: 'employeeData/:id', component: EmployeeDataComponent },
  { path: 'thankYou', component: ThankYouComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'pendingUser', component: PendingUserComponent },

  // Dashboard Section under MainLayout
  {
    path: 'mainlayout',
    component: MainlayoutComponent,
     
    children: [       
      {path: 'signup', component: SignupComponent,canActivate: [adminAuthGuard], },
      {path: 'dashboard', component: DashboardhomeComponent,canActivate: [adminAuthGuard],},
      {path: 'holidays', component: HoildayCalendarComponent,canActivate: [adminAuthGuard], },
      {path: 'feedbacks', component: FeedbacksComponent,canActivate: [adminAuthGuard], },
      {path:'organization', component:OrganizationComponent,canActivate: [adminAuthGuard],},
      {path: 'workhours',component: WorkhoursComponent,canActivate: [adminAuthGuard],},
      {path: 'workhistory', component: WorkHistoryComponent,canActivate: [adminAuthGuard],},
      {path:'wishcard', component: WishcardComponent,canActivate: [adminAuthGuard],},
      {path:'announcement', component:AnnouncementComponent,canActivate: [adminAuthGuard],},
      {path: 'applyleave', component:ApplyLeaveComponent,canActivate: [adminAuthGuard],},
      {path:'myleave',component:LeaveComponent,canActivate: [adminAuthGuard],},
      {path:'workfromhome',component:WorkfromhomeComponent,canActivate: [adminAuthGuard],},
      {path:'hiring', component: HiringComponent,canActivate: [adminAuthGuard],},
      {path:'Timelog', component:TimelogComponent,canActivate: [adminAuthGuard],},
      {path:'task', component:TaskComponent,canActivate: [adminAuthGuard],},
      {path:'resignation', component:ResignationComponent,canActivate: [adminAuthGuard],},
      {path:'okr',component:OkrComponent,canActivate: [adminAuthGuard],},
      {path:'attendance', component:AttendanceComponent,canActivate: [adminAuthGuard],},
      {path:'addopening', component:AddOpeningComponent,canActivate: [adminAuthGuard],},
      {path:'goal', component:GoalComponent,canActivate: [adminAuthGuard],},
      { path: 'add-announcement', component: AddAnnouncementComponent,canActivate: [adminAuthGuard], },

      
      { path: 'personal', component: PersonalComponent,canActivate: [userAuthGuard] },
      { path: 'kyc', component: KycComponent ,canActivate:[userAuthGuard]},
      { path: 'passport', component: PassportVisaComponent,canActivate: [userAuthGuard] },
      { path: 'family', component: FamilyComponent,canActivate: [userAuthGuard] },
      { path: 'previousEmployee', component: PreviousEmploymentComponent,canActivate: [userAuthGuard] },
      { path: 'education', component: EducationComponent,canActivate: [userAuthGuard] },
      { path: 'skills', component: SkillsComponent,canActivate: [userAuthGuard] },
      { path: 'certificate', component: CertificateComponent,canActivate: [userAuthGuard] },
      { path: 'document', component: DocumentComponent,canActivate: [userAuthGuard] },
      { path: 'resume', component: ResumeComponent,canActivate: [userAuthGuard] },
      { path: 'final', component: FinalComponent,canActivate: [userAuthGuard] },
      { path: 'thankYou', component: ThankYouComponent ,canActivate: [userAuthGuard]},
      { path: 'add-employee', component: AddEmployeeComponent ,canActivate: [adminAuthGuard],},
      { path: 'payroll-dashbord', component: DashboardComponent ,canActivate: [adminAuthGuard],},
      { path: 'payroll-employee', component: PayrollEmployeeComponent ,canActivate: [adminAuthGuard],},
      { path: 'payroll-employee/:id', component: EmployeeViewComponent,canActivate: [adminAuthGuard],},
      { path: 'payruns', component: PayrunsComponent,canActivate: [adminAuthGuard],},
      { path: 'payruns/:id', component: AddSalaryComponent,canActivate: [adminAuthGuard],},
      { path: 'payruns/:empId/:salaryId', component: MonthlySalarySlipComponent,canActivate: [adminAuthGuard],},
      {path:'reports',component:ReportComponent,canActivate: [adminAuthGuard],},
      {path:'reports/:empId',component:YearlySalarySlipComponent,canActivate: [adminAuthGuard],},
      { path: 'pendingUser', component: PendingUserComponent ,canActivate: [adminAuthGuard],},
      { path: 'admin', component: AdminComponent ,canActivate: [adminAuthGuard],},

      // Employee details view page
       { path: 'empdetails/:id', component: EmployeeDetailsComponent ,canActivate: [adminAuthGuard],},
       { path: 'empkyc/:id', component: EmpkycComponent ,canActivate: [adminAuthGuard],},
       { path: 'emppassport/:id', component: EmppassportComponent ,canActivate: [adminAuthGuard],},
       { path: 'empfamily/:id', component: EmpfamilyComponent,canActivate: [adminAuthGuard], },
       { path: 'emppreviousEmployee/:id', component: EmppreviousEmployeeComponent,canActivate: [adminAuthGuard], },
       { path: 'empeducation/:id', component: EmpeducationComponent ,canActivate: [adminAuthGuard],},
       { path: 'empskills/:id', component: EmpskillsComponent,canActivate: [adminAuthGuard], },
       { path: 'empcertificate/:id', component: EmpcertificateComponent ,canActivate: [adminAuthGuard],},
       { path: 'empdocument/:id', component: EmpdocumentComponent ,canActivate: [adminAuthGuard],},
       { path: 'empresume/:id', component: EmpresumeComponent ,canActivate: [adminAuthGuard],},
       { path: 'empfinal/:id', component: EmpfinalComponent ,canActivate: [adminAuthGuard],},
    ]
  },

  // Employee Details routes
  // { path: 'admin/empdetails', component: EmployeeDetailsComponent },
  // { path: 'admin/empkyc', component: EmpkycComponent },
  // { path: 'admin/emppassport', component: EmppassportComponent },
  // { path: 'admin/empfamily', component: EmpfamilyComponent },
  // { path: 'admin/emppreviousEmployee', component: EmppreviousEmployeeComponent },
  // { path: 'admin/empeducation', component: EmpeducationComponent },
  // { path: 'admin/empskills', component: EmpskillsComponent },
  // { path: 'admin/empcertificate', component: EmpcertificateComponent },
  // { path: 'admin/empdocument', component: EmpdocumentComponent },
  // { path: 'admin/empresume', component: EmpresumeComponent },
  // { path: 'admin/empfinal', component: EmpfinalComponent },
  // { path: 'timesheet', component: TimeSheetComponent },
  // { path: 'timesheet-view/:id', component: TimeSheetViewComponent },
// Payroll 
  // {path:"add-employee",component:AddEmployeeComponent},

  { path: '**', component: HomeComponent }, // Wildcard route

  
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
