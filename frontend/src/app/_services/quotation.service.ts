import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class QuotationService {
  private apiname = "quotations";
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
  findDetailBy(data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/finddetail`,
      data
    );
  }
  findNoTotal(data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/findnototal`,
      data
    );
  }
  add(data) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}`, data);
  }
  update(id, data) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}/${id}`, data);
  }
  updateQuotationStock(id, data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/updatequotationstock/${id}`,
      data
    );
  }
  updateStatusApprove(id, data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/updatestatusapprove/${id}`,
      data
    );
  }
  updateAllApprove(data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/updateallapprove`,
      data
    );
  }

  updateAllTotal(data) {
    return this.http.post(
      `${environment.apiUrl}/${this.apiname}/updatealltotal`,
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
