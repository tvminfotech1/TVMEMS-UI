import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "./models/baseurl/constant";

@Injectable({
  providedIn: "root",
})
export class ChangePasswordService {
  private baseUrl = `${BASE_URL}`;

  constructor(private http: HttpClient) {}

  validatePassword(payload: {
    employeeId: number;
    currentPassword: string;
  }): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/validate-password`,
      payload
    );
  }

  changePassword(payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/change-password`, payload);
  }
}
