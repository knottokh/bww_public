import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../_services';
import { RouterPath } from '../../../_models';

import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { EncodeSpacialC } from '../../../_helpers';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./../verification.component.scss', './forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgetForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.forgetForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgetForm.controls; }

  onSubmit() {

    this.loading = true;
    var encEmail = EncodeSpacialC(CryptoJS.AES.encrypt(this.f.email.value, environment.encPassword).toString());
    //console.log(encEmail);
    this.userService.forgetpassowrd(this.f.username.value, this.f.email.value)
        .subscribe(
            (data: any) => {
              //this.router.navigate([`/${ RouterPath.complete }`], { queryParams: { fp: 'for',mp: encEmail} });
              if(data.status){
                  this.router.navigate([`/${ RouterPath.forgetcomplete }`], { queryParams: { fp: 'for', mp: encEmail} });
              }
              else{
                this.error = 'mail-send-failed';
                this.loading = false;
              }
            },
            error => {
                this.error = error;
                this.loading = false;
    });
  }

}
