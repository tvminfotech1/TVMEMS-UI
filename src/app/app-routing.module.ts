import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PersonalComponent } from "./components/personal/personal.component";
import { KycComponent } from "./components/kyc/kyc.component";
import { PassportVisaComponent } from "./components/passport-visa/passport-visa.component";
import { FamilyComponent } from "./components/family/family.component";
import { EducationComponent } from "./components/education/education.component";
import { SkillsComponent } from "./components/skills/skills.component";
import { CertificateComponent } from "./components/certificate/certificate.component";
import { DocumentComponent } from "./components/document/document.component";
import { ResumeComponent } from "./components/resume/resume.component";
import { FinalComponent } from "./components/final/final.component";
import { PreviousEmploymentComponent } from "./components/previous-employment/previous-employment.component";

import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { SignupComponent } from "./components/signup/signup.component";
import { AdminComponent } from "./components/admin/admin.component";
import { AdminLoginComponent } from "./components/admin-login/admin-login.component";
import { EmployeeDataComponent } from "./components/employee-data/employee-data.component";
import { LoginByNumberComponent } from "./components/login-by-number/login-by-number.component";
import { ThankYouComponent } from "./components/thank-you/thank-you.component";
import { PendingUserComponent } from "./components/pending-user/pending-user.component";
import { MainlayoutComponent } from "./components/mainlayout/mainlayout.component";
import { DashboardhomeComponent } from "./components/mainlayout/dashboardhome/dashboardhome.component";
import { HolidayCalendarComponent } from "./components/mainlayout/hoilday-calendar/hoilday-calendar.component";
import { WorkhoursComponent } from "./components/mainlayout/workhours/workhours.component";
import { WorkHistoryComponent } from "./components/mainlayout/work-history/work-history.component";
import { WishcardComponent } from "./components/mainlayout/wishcard/wishcard.component";
import { AnnouncementComponent } from "./components/mainlayout/announcement/announcement.component";
import { LeaveComponent } from "./components/mainlayout/leave/leave.component";
import { WorkfromhomeComponent } from "./components/mainlayout/workfromhome/workfromhome.component";
import { TimelogComponent } from "./components/mainlayout/timelog/timelog.component";
import { TaskComponent } from "./components/mainlayout/task/task.component";
import { ResignationComponent } from "./components/mainlayout/resignation/resignation.component";
import { AttendanceComponent } from "./components/mainlayout/attendance/attendance.component";
import { OrganizationComponent } from "./components/mainlayout/organization/organization.component";
import { AddOpeningComponent } from "./components/mainlayout/addopening/addopening.component";
import { GoalComponent } from "./components/mainlayout/goal/goal.component";
import { DashboardComponent } from "./components/payroll/dashboard/dashboard.component";
import { AddEmployeeComponent } from "./components/payroll/add-employee/add-employee.component";
import { PayrollEmployeeComponent } from "./components/payroll/payroll-employee/payroll-employee.component";
import { EmployeeViewComponent } from "./components/payroll/employee-view/employee-view.component";
import { PayrunsComponent } from "./components/payroll/payruns/payruns.component";
import { AddSalaryComponent } from "./components/payroll/add-salary/add-salary.component";
import { MonthlySalarySlipComponent } from "./components/payroll/monthly-salary-slip/monthly-salary-slip.component";
import { ReportComponent } from "./components/payroll/report/report.component";
import { YearlySalarySlipComponent } from "./components/payroll/yearly-salary-slip/yearly-salary-slip.component";
import { adminAuthGuard } from "./guards/admin-auth.guard";
import { userAuthGuard } from "./guards/user-auth.guard";
import { AdminAttendanceComponent } from "./components/mainlayout/admin-attendance/admin-attendance.component";
import { AuthGuard } from "./guards/auth.guard";
import { MyProfileComponent } from "./components/mainlayout/my-profile/my-profile.component";
import { JobOpeningListComponent } from "./components/mainlayout/job-opening-list/job-opening-list.component";
import { UserPayslipComponent } from "./components/payroll/user-payslip/user-payslip.component";
import { StepGuard } from "./guards/step.guard";
import { ChangePasswordComponent } from "./components/mainlayout/change-password/change-password.component";

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
        path: "workhours",
        component: WorkhoursComponent,
        canActivate: [adminAuthGuard],
      },
      {
        path: "workhistory",
        component: WorkHistoryComponent,
        canActivate: [adminAuthGuard],
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
