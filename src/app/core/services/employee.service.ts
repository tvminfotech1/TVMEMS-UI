import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "../constant/constant";

@Injectable({ providedIn: "root" })
export class EmployeeService {
  private readonly employeeApiUrl = `${BASE_URL}/personal/findAll`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.employeeApiUrl);
  }

  downloadDocument(fileId: number): Observable<Blob> {
    return this.http.get(`${BASE_URL}/documents/${fileId}/download`, {
      responseType: "blob",
    });
  }

  getEmployeePhoto(employeeId: string | number): Observable<Blob> {
    return this.http.get(`${BASE_URL}/documents/photo/${employeeId}`, {
      responseType: "blob",
    });
  }
}
