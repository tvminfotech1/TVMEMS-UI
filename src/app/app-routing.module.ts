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
  { path: 'signup', component: SignupComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'adminLogin', component: AdminLoginComponent },
  { path: 'employeeData/:id', component: EmployeeDataComponent },
  { path: 'thankYou', component: ThankYouComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'pendingUser', component: PendingUserComponent },

  // Dashboard Section under MainLayout
  {
    path: 'mainlayout',
    component: MainlayoutComponent,
    children: [       
      {path: 'dashboard', component: DashboardhomeComponent},
      {path: 'holidays', component: HoildayCalendarComponent },
      {path: 'feedbacks', component: FeedbacksComponent },
      {path:'organization', component:OrganizationComponent},
      {path: 'workhours',component: WorkhoursComponent},
      {path: 'workhistory', component: WorkHistoryComponent},
      {path:'wishcard', component: WishcardComponent},
      {path:'announcement', component:AnnouncementComponent},
      {path: 'applyleave', component:ApplyLeaveComponent},
      {path:'myleave',component:LeaveComponent},
      {path:'workfromhome',component:WorkfromhomeComponent},
      {path:'hiring', component: HiringComponent},
      {path:'Timelog', component:TimelogComponent},
      {path:'task', component:TaskComponent},
      {path:'resignation', component:ResignationComponent},
      {path:'okr',component:OkrComponent},
      {path:'attendance', component:AttendanceComponent},
      {path:'addopening', component:AddOpeningComponent},
      {path:'goal', component:GoalComponent},
      
      { path: 'personal', component: PersonalComponent },
      { path: 'kyc', component: KycComponent },
      { path: 'passport', component: PassportVisaComponent },
      { path: 'family', component: FamilyComponent },
      { path: 'previousEmployee', component: PreviousEmploymentComponent },
      { path: 'education', component: EducationComponent },
      { path: 'skills', component: SkillsComponent },
      { path: 'certificate', component: CertificateComponent },
      { path: 'document', component: DocumentComponent },
      { path: 'resume', component: ResumeComponent },
      { path: 'final', component: FinalComponent },
    ]
  },

  // Employee Details routes
  { path: 'admin/empdetails', component: EmployeeDetailsComponent },
  { path: 'admin/empkyc', component: EmpkycComponent },
  { path: 'admin/emppassport', component: EmppassportComponent },
  { path: 'admin/empfamily', component: EmpfamilyComponent },
  { path: 'admin/emppreviousEmployee', component: EmppreviousEmployeeComponent },
  { path: 'admin/empeducation', component: EmpeducationComponent },
  { path: 'admin/empskills', component: EmpskillsComponent },
  { path: 'admin/empcertificate', component: EmpcertificateComponent },
  { path: 'admin/empdocument', component: EmpdocumentComponent },
  { path: 'admin/empresume', component: EmpresumeComponent },
  { path: 'admin/empfinal', component: EmpfinalComponent },
  { path: 'timesheet', component: TimeSheetComponent },
  { path: 'timesheet-view/:id', component: TimeSheetViewComponent },
  { path: '**', component: HomeComponent }, // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
