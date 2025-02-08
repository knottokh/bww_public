import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) { }

  add(_iden, _hn, _phone, _email, _birthday, _username, _isdoctor) {

    if (_isdoctor) {
      const doctor = {
        identification: _iden,
        email: _email,
        birthday: _birthday,
        username: _username,
        isdoctor: _isdoctor
      };
      return this.http.post(`${environment.apiUrl}/auth/register`, doctor);
    }
    else {
      const user = {
        identification: _iden,
        hn: _hn,
        phone: _phone,
        email: _email,
        username: _username,
        isdoctor: _isdoctor
      };
      return this.http.post(`${environment.apiUrl}/auth/register`, user);
    }
  }

  forgetpassowrd(_username, _email) {
    const user = {
      username: _username,
      email: _email
    };
    return this.http.post(`${environment.apiUrl}/auth/forgot_password`, user);
  }

  resetpassowrd(_password, __confirmpassword, _token) {
    const pass = {
      newPassword: _password,
      verifyPassword: __confirmpassword,
      token: _token
    };
    return this.http.post(`${environment.apiUrl}/auth/reset_password`, pass);
  }

  change_password(_username, _email, _old_password, __confirmpassword, _token) {
    const pass = {
      username: _username,
      email: _email,
      old_password: _old_password,
      password: __confirmpassword,
      //token: _token
    };
    return this.http.post(`${environment.apiUrl}/auth/change_password`, pass);
  }
}
