import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private apiname = 'files';
  constructor(private http: HttpClient) { }

  download(filename: any) {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiname}/${filename}`);
  }

  downloadUrl(filename: any) {
    return `${environment.apiUrl}/${this.apiname}/web/${filename}`;
  }
}
