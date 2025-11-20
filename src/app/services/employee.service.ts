import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class EmployeeService {
  private readonly baseUrl = "http://localhost:8080";
  private readonly employeeApiUrl = `${this.baseUrl}/personal/findAll`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.employeeApiUrl);
  }

  downloadDocument(fileId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${fileId}/download`, {
      responseType: "blob",
    });
  }

  getEmployeePhoto(employeeId: string | number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/photo/${employeeId}`, {
      responseType: "blob",
    });
  }
}
