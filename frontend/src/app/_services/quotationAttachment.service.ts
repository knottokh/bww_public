import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class QuotationAttachmentService {
  private apiname = "quotation_attachments";
  constructor(private http: HttpClient) {}

  // getAll() {
  //   return this.http.get<any>(`${environment.apiUrl}/${this.apiname}`);
  // }

  findBy(data) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}/findby`, data);
  }
  getById(id: any) {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiname}/${id}`);
  }
  add(data) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}`, data);
  }
  update(id, data) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}/${id}`, data);
  }
  updateStatusApprove(id, data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/updatestatusapprove/${id}`,
      data
    );
  }
  delete(id) {
    return this.http.delete(`${environment.apiUrl}/${this.apiname}/${id}`);
  }
  deletemany(data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/deletemany`,
      data
    );
  }
}
