import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../_models';
import { environment } from '../../environments/environment';

export class RememberMe {
  username: string;
  password: string;
  remember: boolean;
}
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private storageUserName: string = 'bww2022currentUser';
  private storageRememberName: string = 'bww2022memLigin';

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  private currentRememberSubject: BehaviorSubject<RememberMe>;
  public currentRemember: Observable<RememberMe>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.storageUserName)));
    this.currentUser = this.currentUserSubject.asObservable();
    this.currentRememberSubject = new BehaviorSubject<RememberMe>(JSON.parse(localStorage.getItem(this.storageRememberName)));
    this.currentRemember = this.currentRememberSubject.asObservable();
  }

  public get currentUserValue(): User {
    //localStorage.removeItem(this.storageUserName);
    return this.currentUserSubject.value;
  }

  public get currentRememberValue(): RememberMe {
    return this.currentRememberSubject.value;
  }

  public setCurrentUserValue(user){
    localStorage.setItem(this.storageUserName, JSON.stringify(user));
  }

  login(username: string, password: string, rememberme: boolean, isuser: Boolean) {
    return this.http.post<any>(`${environment.apiUrl}/auth/sign_in`, { username, password })
      .pipe(map(user => {
        //console.log(user);
        if (user) {
          let today = new Date();
          //console.log(user.active_start);
          if(new Date(user.active_start) > today || today > new Date(user.active_end)){
            console.log('user is not in active period');
            throw new Error('user is not in active period');
          }
          else if(!user.active){
            //console.log('user is disable');
            throw new Error('user is disable');
          }
        }
        //console.log(user);
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(this.storageUserName, JSON.stringify(user));
          this.currentUserSubject.next(user);

          //remmeber me
          /* if(rememberme){
             let remember = {
               username: username,
               password: password,
               remember: rememberme
             };
             localStorage.setItem(this.storageRememberName, JSON.stringify(remember));
             this.currentRememberSubject.next(remember);
           }
           else{
             localStorage.removeItem(this.storageRememberName);
             this.currentRememberSubject.next(null);
           }*/
        }
        //this.chatService.getActiveList();
        return user;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem(this.storageUserName);
    this.currentUserSubject.next(null);
  }
}
