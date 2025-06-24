import { Component } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  showLogin = true;

  toggleForm(isLogin: boolean): void {
    this.showLogin = isLogin;
  }
}
