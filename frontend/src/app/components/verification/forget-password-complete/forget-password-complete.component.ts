import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { DecodeSpacialC } from '../../../_helpers';
import { RouterPath } from '../../../_models';

@Component({
  selector: 'app-forget-password-complete',
  templateUrl: './forget-password-complete.component.html',
  styleUrls: ['./../verification.component.scss', './forget-password-complete.component.scss']
})
export class ForgetPasswordCompleteComponent implements OnInit {
  tranmessage: string;
  selectemail: string;

  constructor(private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
   // console.log(this.route.snapshot.queryParams['fp'] );
    let from = this.route.snapshot.queryParams['fp'] || 'rig';
    let befordec =  this.route.snapshot.queryParams['mp'] || '';
    if(befordec.length > 0){
      this.selectemail = CryptoJS.AES.decrypt(DecodeSpacialC(befordec), environment.encPassword).toString(CryptoJS.enc.Utf8);
    }
    else{
      this.selectemail = 'example@mail.com';
    }
    let map = {
     // 'rig': 'complete.register',
      'for': 'complete.forgetpassword',
      'rep': 'complete.resetpassword'
    }
    this.tranmessage = map[from];
  }
  onBack(){
    this.router.navigate([`/${ RouterPath.root }`]);
  }

}
