import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../../_services';
import { Role, RouterPath } from '../../../_models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./../verification.component.scss', './login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  routepath: any;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  isuser = true;
  trantitle = 'title';
  trandiscription1 = 'discription.l1';
  trandiscription2 = 'discription.l2';
  trandiscription3 = 'discription.l3';

  usernameIco = 'assets/svg/profile_ic.svg';
  pwIco = 'assets/svg/password_ic.svg';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.routepath = RouterPath;
    if (this.router.url === `/${RouterPath.adminlogin}`) {
      this.isuser = false;
      this.trantitle = 'admin-title';
      this.trandiscription1 = 'admin-discription';
      this.trandiscription2 = '';
      this.trandiscription3 = '';
    }
    //console.log(this.authenticationService.currentUserValue);
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate([`/${RouterPath.root}`]);
    }
  }

  ngOnInit() {
    //console.log(this.authenticationService.currentRememberValue);
    let remem = this.authenticationService.currentRememberValue;
    this.loginForm = this.formBuilder.group({
      username: [(remem ? remem.username : ''), Validators.required],
      password: [(remem ? remem.password : ''), Validators.required],
      remember: [(remem ? remem.remember : false)]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || `/${RouterPath.root}`;
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    //this.submitted = true;

    // stop here if form is invalid
    //if (this.loginForm.invalid) {
    //    return;
    //}

    this.loading = true;
    //console.log(this.f.remember.value);
    this.authenticationService.login(this.f.username.value, this.f.password.value, this.f.remember.value, this.isuser)
      .pipe(first())
      .subscribe(
        data => {
          let gotoUrl = this.returnUrl;
          gotoUrl = `/${RouterPath.root}`;
          //console.log(data);

          /*let urole = data['role'];
          //console.log(urole);
          if(urole){

            if(( this.returnUrl === `/${ RouterPath.root }`) && urole){
              if(urole === Role.Admin||
                urole === Role.SuperAdmin){
                gotoUrl = `/${ RouterPath.management }`;
              }
            }
            this.router.navigate([gotoUrl]);
          }
          else{
            this.authenticationService.logout();
            location.reload(true);
          }*/
          this.router.navigate([gotoUrl]);

        },
        error => {
          this.error = error;
          this.loading = false;
        });
  }

}
