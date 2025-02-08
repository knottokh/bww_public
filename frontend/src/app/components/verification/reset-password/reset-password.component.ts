import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPasswordStrengthComponent } from '@angular-material-extensions/password-strength';
import { UserService } from '../../../_services';
import { MustMatch } from '../../../_helpers';
import { RouterPath } from '../../../_models';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./../verification.component.scss', './reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  //passwordComponent: MatPasswordStrengthComponent;
  //confpasswordComponent: MatPasswordStrengthComponent;
  showDetails = false;
  loading = false;
  error = '';
  token: String;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  get f() { return this.resetPasswordForm.controls; }

  onStrengthChanged(strength: number) {

    this.showDetails = (strength < 100);
    //console.log('password strength = ', strength);
  }

  onSubmit() {

    this.loading = true;
    this.userService.resetpassowrd(this.f.password.value, this.f.confirmPassword.value, this.token)
        .subscribe(
            data => {
              //this.router.navigate([`/${ RouterPath.forgetcomplete }?fp=rep`]);
              this.router.navigate([`/${ RouterPath.forgetcomplete }`], { queryParams: { fp: 'rep'} });
            },
            error => {
                console.log(error);
                this.error = error;
                this.loading = false;
            });
  }

}
