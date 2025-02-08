import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiname = 'stocks';
  constructor(private http: HttpClient) { }

  // getAll() {
  //   return this.http.get<any>(`${environment.apiUrl}/${this.apiname}`);
  // }
  getStockTypes() {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiname}/stockTypes`);
  }

  getUnits() {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiname}/units`);
  }

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
  update_sequence(items) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}/update_sequence`, {
      items: items
    });
  }
  delete(id) {
    return this.http.delete(`${environment.apiUrl}/${this.apiname}/${id}`);
  }
  deletemany(data) {
    return this.http.post(`${environment.apiUrl}/${this.apiname}/deletemany`, data);
  }
}
