import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PersonalComponent } from "./features/form/onboadingForm/personal/personal.component";
import { KycComponent } from "./features/form/onboadingForm/kyc/kyc.component";
import { PassportVisaComponent } from "./features/form/onboadingForm/passport-visa/passport-visa.component";
import { FamilyComponent } from "./features/form/onboadingForm/family/family.component";
import { PreviousEmploymentComponent } from "./features/form/onboadingForm/previous-employment/previous-employment.component";
import { EducationComponent } from "./features/form/onboadingForm/education/education.component";
import { SkillsComponent } from "./features/form/onboadingForm/skills/skills.component";
import { CertificateComponent } from "./features/form/onboadingForm/certificate/certificate.component";
import { DocumentComponent } from "./features/form/onboadingForm/document/document.component";
import { ResumeComponent } from "./features/form/onboadingForm/resume/resume.component";
import { FinalComponent } from "./features/form/onboadingForm/final/final.component";
import { HomeComponent } from "./features/logins/home/home.component";
import { NavComponent } from "./features/logins/nav/nav.component";
import { NavDetailsComponent } from "./features/form/onboadingForm/nav-details/nav-details.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginComponent } from "./features/logins/login/login.component";
import { SignupComponent } from "./features/logins/signup/signup.component";
import { AdminComponent } from "./features/form/userList/admin.component";
import { AdminLoginComponent } from "./features/logins/admin-login/admin-login.component";
import { EmployeeDataComponent } from "./features/employee-data/employee-data.component";
import { LoginByNumberComponent } from "./features/logins/login-by-number/login-by-number.component";
import { PendingUserComponent } from "./features/form/pending-user/pending-user.component";
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";
import { NavDisplayComponent } from "./features/form/onboadingForm/nav-display/nav-display.component";
import { HolidayCalendarComponent } from "./features/dashboard/hoilday-calendar/hoilday-calendar.component";
import { DashboardhomeComponent } from "./features/dashboard/dashboardhome/dashboardhome.component";
import { MainlayoutComponent } from "./features/mainlayout/mainlayout.component";
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
import { AddSalaryComponent } from "./features/payroll/add-salary/add-salary.component";
import { DashboardComponent } from "./features/payroll/dashboard/dashboard.component";
import { EmployeeViewComponent } from "./features/payroll/employee-view/employee-view.component";
import { MonthlySalarySlipComponent } from "./features/payroll/monthly-salary-slip/monthly-salary-slip.component";
import { PayrollEmployeeComponent } from "./features/payroll/payroll-employee/payroll-employee.component";
import { PayrunsComponent } from "./features/payroll/payruns/payruns.component";
import { ReportComponent } from "./features/payroll/report/report.component";
import { YearlySalarySlipComponent } from "./features/payroll/yearly-salary-slip/yearly-salary-slip.component";
import { AddEmployeeComponent } from "./features/payroll/add-employee/add-employee.component";
import { MyProfileComponent } from "./features/dashboard/my-profile/my-profile.component";
import { AdminAttendanceComponent } from "./features/entries/admin-attendance/admin-attendance.component";
import { WfhApplyFormComponent } from "./features/wfh/wfh-apply-form/wfh-apply-form.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatRadioModule } from "@angular/material/radio";
import { A11yModule } from "@angular/cdk/a11y";
import {
  MAT_DATE_FORMATS,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MY_DATE_FORMATS } from "./core/models/date-formats";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { ThankYouComponent } from "./features/form/onboadingForm/thank-you/thank-you.component";
import { JobOpeningListComponent } from "./features/jobOpening/job-opening-list/job-opening-list.component";
import { JobEditDialogComponent } from "./features/jobOpening/job-edit-dialog/job-edit-dialog.component";
import { CommonModule, DatePipe } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { UserPayslipComponent } from "./features/payroll/user-payslip/user-payslip.component";
import { LoaderComponent } from "./shared/components/loader/loader.component";
import { ChangePasswordComponent } from "./features/logins/change-password/change-password.component";
import { LoaderInterceptor } from "./core/services/loader.interceptor";
import { CommonAlertComponent } from './shared/components/common-alert/common-alert.component';

@NgModule({
  declarations: [
    AppComponent,
    PersonalComponent,
    KycComponent,
    PassportVisaComponent,
    FamilyComponent,
    PreviousEmploymentComponent,
    EducationComponent,
    SkillsComponent,
    CertificateComponent,
    DocumentComponent,
    ResumeComponent,
    FinalComponent,
    HomeComponent,
    NavComponent,
    NavDetailsComponent,
    LoginComponent,
    SignupComponent,
    AdminComponent,
    AdminLoginComponent,
    EmployeeDataComponent,
    LoginByNumberComponent,
    PendingUserComponent,
    ThankYouComponent,
    NavDisplayComponent,
    HolidayCalendarComponent,
    DashboardhomeComponent,
    MainlayoutComponent,
    WishcardComponent,
    AnnouncementComponent,
    LeaveComponent,
    WorkfromhomeComponent,
    TimelogComponent,
    TaskComponent,
    ResignationComponent,
    AttendanceComponent,
    OrganizationComponent,
    AddOpeningComponent,
    GoalComponent,
    AddSalaryComponent,
    DashboardComponent,
    EmployeeViewComponent,
    MonthlySalarySlipComponent,
    PayrollEmployeeComponent,
    PayrunsComponent,
    ReportComponent,
    YearlySalarySlipComponent,
    AddEmployeeComponent,
    MyProfileComponent,
    AdminAttendanceComponent,
    WfhApplyFormComponent,
    JobOpeningListComponent,
    JobEditDialogComponent,
    UserPayslipComponent,
    LoaderComponent,
    CommonAlertComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatIconModule,
    MatTableModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatDialogModule,
    MatTableModule,
    A11yModule,
    CommonModule,
  ],
  providers: [
     {
    provide: HTTP_INTERCEPTORS,
    useClass: LoaderInterceptor, 
    multi: true
  },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
