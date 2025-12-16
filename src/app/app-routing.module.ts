import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PersonalComponent } from "./features/form/onboadingForm/personal/personal.component";
import { KycComponent } from "./features/form/onboadingForm/kyc/kyc.component";
import { PassportVisaComponent } from "./features/form/onboadingForm/passport-visa/passport-visa.component";
import { FamilyComponent } from "./features/form/onboadingForm/family/family.component";
import { EducationComponent } from "./features/form/onboadingForm/education/education.component";
import { SkillsComponent } from "./features/form/onboadingForm/skills/skills.component";
import { CertificateComponent } from "./features/form/onboadingForm/certificate/certificate.component";
import { DocumentComponent } from "./features/form/onboadingForm/document/document.component";
import { ResumeComponent } from "./features/form/onboadingForm/resume/resume.component";
import { FinalComponent } from "./features/form/onboadingForm/final/final.component";
import { PreviousEmploymentComponent } from "./features/form/onboadingForm/previous-employment/previous-employment.component";

import { HomeComponent } from "./features/logins/home/home.component";
import { LoginComponent } from "./features/logins/login/login.component";
import { SignupComponent } from "./features/logins/signup/signup.component";
import { AdminComponent } from "./features/form/userList/admin.component";
import { AdminLoginComponent } from "./features/logins/admin-login/admin-login.component";
import { EmployeeDataComponent } from "./features/employee-data/employee-data.component";
import { LoginByNumberComponent } from "./features/logins/login-by-number/login-by-number.component";
import { ThankYouComponent } from "./features/form/onboadingForm/thank-you/thank-you.component";
import { PendingUserComponent } from "./features/form/pending-user/pending-user.component";
import { MainlayoutComponent } from "./features/mainlayout/mainlayout.component";
import { DashboardhomeComponent } from "./features/dashboard/dashboardhome/dashboardhome.component";
import { HolidayCalendarComponent } from "./features/dashboard/hoilday-calendar/hoilday-calendar.component";
import { WishcardComponent } from "./features/dashboard/wishcard/wishcard.component";
import { AnnouncementComponent } from "./features/dashboard/announcement/announcement.component";
import { LeaveComponent } from "./features/entries/leave/leave.component";
import { WorkfromhomeComponent } from "./features/wfh/workfromhome/workfromhome.component";
import { TimelogComponent } from "./features/entries/timelog/timelog.component";
import { TaskComponent } from "./features/task/task.component";
import { ResignationComponent } from "./features/resignation/resignation.component";
import { AttendanceComponent } from "./features/entries/attendance/attendance.component";
import { OrganizationComponent } from "./features/payroll/organization/organization.component";
import { AddOpeningComponent } from "./features/jobOpening/addopening/addopening.component";
import { GoalComponent } from "./features/goal/goal.component";
import { DashboardComponent } from "./features/payroll/dashboard/dashboard.component";
import { AddEmployeeComponent } from "./features/payroll/add-employee/add-employee.component";
import { PayrollEmployeeComponent } from "./features/payroll/payroll-employee/payroll-employee.component";
import { EmployeeViewComponent } from "./features/payroll/employee-view/employee-view.component";
import { PayrunsComponent } from "./features/payroll/payruns/payruns.component";
import { AddSalaryComponent } from "./features/payroll/add-salary/add-salary.component";
import { MonthlySalarySlipComponent } from "./features/payroll/monthly-salary-slip/monthly-salary-slip.component";
import { ReportComponent } from "./features/payroll/report/report.component";
import { YearlySalarySlipComponent } from "./features/payroll/yearly-salary-slip/yearly-salary-slip.component";
import { adminAuthGuard } from "./core/guards/admin-auth.guard";
import { userAuthGuard } from "./core/guards/user-auth.guard";
import { AdminAttendanceComponent } from "./features/entries/admin-attendance/admin-attendance.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { MyProfileComponent } from "./features/dashboard/my-profile/my-profile.component";
import { JobOpeningListComponent } from "./features/jobOpening/job-opening-list/job-opening-list.component";
import { UserPayslipComponent } from "./features/payroll/user-payslip/user-payslip.component";
import { StepGuard } from "./core/guards/step.guard";
import { ChangePasswordComponent } from "./features/logins/change-password/change-password.component";

const routes: Routes = [
  { path: "", component: HomeComponent },

  { path: "login", component: LoginComponent },
  { path: "loginByNumber", component: LoginByNumberComponent },

  { path: "admin", component: AdminComponent },
  { path: "adminLogin", component: AdminLoginComponent },
  { path: "employeeData/:id", component: EmployeeDataComponent },
  { path: "thankYou", component: ThankYouComponent },
  { path: "pendingUser", component: PendingUserComponent },

  {
    path: "mainlayout",
    component: MainlayoutComponent,

    children: [
      {
        path: "signup",
        component: SignupComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "dashboard",
        component: DashboardhomeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "myprofile/:id",
        component: MyProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "holidays",
        component: HolidayCalendarComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "organization",
        component: OrganizationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "wishcard",
        component: WishcardComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "announcement",
        component: AnnouncementComponent,
        canActivate: [adminAuthGuard],
      },
      { path: "myleave", component: LeaveComponent, canActivate: [AuthGuard] },
      {
        path: "workfromhome",
        component: WorkfromhomeComponent,
        canActivate: [AuthGuard],
      },

      { path: "Timelog", component: TimelogComponent },
      { path: "task", component: TaskComponent, canActivate: [AuthGuard] },
      {
        path: "resignation",
        component: ResignationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "attendance",
        component: AttendanceComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "attendance-approval",
        component: AdminAttendanceComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "addopening",
        component: AddOpeningComponent,
        canActivate: [adminAuthGuard],
      },
      { path: "seeJobOpening", component: JobOpeningListComponent },
      { path: "goal", component: GoalComponent, canActivate: [AuthGuard] },
      { path: "payslip", component: UserPayslipComponent },

      {
        path: "changepassword",
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "personal",
        component: PersonalComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 1 },
      },
      {
        path: "kyc",
        component: KycComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 2 },
      },
      {
        path: "passport",
        component: PassportVisaComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 3 },
      },
      {
        path: "family",
        component: FamilyComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 4 },
      },

      {
        path: "previousEmployee",
        component: PreviousEmploymentComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 5 },
      },
      {
        path: "education",
        component: EducationComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 6 },
      },
      {
        path: "skills",
        component: SkillsComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 7 },
      },
      {
        path: "certificate",
        component: CertificateComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 8 },
      },
      {
        path: "document",
        component: DocumentComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 9 },
      },
      {
        path: "resume",
        component: ResumeComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 10 },
      },
      {
        path: "final",
        component: FinalComponent,
        canActivate: [StepGuard, userAuthGuard],
        data: { step: 11 },
      },
      {
        path: "thankYou",
        component: ThankYouComponent,
        canActivate: [userAuthGuard],
      },
      {
        path: "add-employee",
        component: AddEmployeeComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "payroll-dashbord",
        component: DashboardComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "payroll-employee",
        component: PayrollEmployeeComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "payroll-employee/:id",
        component: EmployeeViewComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "payruns",
        component: PayrunsComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "payruns/:id",
        component: AddSalaryComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "payruns/:empId/:salaryId",
        component: MonthlySalarySlipComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "reports",
        component: ReportComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "reports/:empId",
        component: YearlySalarySlipComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "pendingUser",
        component: PendingUserComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "admin",
        component: AdminComponent,
        canActivate: [adminAuthGuard],
      },

      {
        path: "settings",
        children: [
          {
            path: "holidays",
            component: HolidayCalendarComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "announcement",
            component: AnnouncementComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
    ],
  },

  { path: "**", component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [StepGuard],
})
export class AppRoutingModule {}
