import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagegridService {
  private apiname = 'files';
  constructor(private http: HttpClient) { }

  getById(id: any) {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiname}/getbyid/${id}`);
  }

  getFileUrl(filename: any) {
    return `${environment.apiUrl}/${this.apiname}/${filename}`
  }

  getFileIDUrl(fileId: any) {
    return `${environment.apiUrl}/${this.apiname}/byid/${fileId}`
  }
}
