import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import {
  AuthenticationService, MyTranslateService, UserService
} from '../../_services';

import {
  User, Role, RouterPath, UploadImage

} from '../../_models';
import { Subscription } from 'rxjs';

import * as $ from 'jquery';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  opened = true;
  change = 'side';

  routepath: any;
  currentUser: User;
  tran: any;
  username: string;
  tranonly: any;

  ua = navigator.userAgent;

  /** START HR port */
  positionArray: any;
  employeeArray: any;
  public employee_id: string;
  public is_manager: boolean;
  public is_admin: boolean;
  profileImageUrl = '';
  loadingImageUrl = 'assets/img/loading.gif';
  defaultImageUrl = 'assets/img/default.jpg';
  /** END HR port */

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private authenticationService: AuthenticationService,
    private translate: MyTranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService
  ) {
    this.tranonly = translate;
    this.routepath = RouterPath;

    this.opened = true;
    this.change = 'side';

    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    if (this.currentUser) {
      this.username = this.currentUser.username;
     // this.loadEmployeeImage(this.currentUser.employee_id);
     this.loadAvatarImage(this.currentUser)
    }
    //console.log(this.currentUser);
    this.tran = translate.mytranslateService;
    //console.log(this.router.url);
    //if (this.router.url == `/${RouterPath.root}`) {
    //  this.router.navigate([`/${RouterPath.home}`]);
    //}
    this.profileImageUrl = this.defaultImageUrl;
  }

  ngOnInit() {
    //get employee list
    //this.setupUserInfo();

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(this.ua))
    this.opened = false;
  }

  ngOnDestroy() {

  }

  get canModify() {
    return this.authenticationService.currentUserValue['role'] == Role.SuperAdmin;
  }

  get isUser() {
    return this.currentUser && this.currentUser.role === Role.User;
  }
  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }
  get isSuperAdmin() {
    return this.currentUser && this.currentUser.role === Role.SuperAdmin;
  }

  logout() {
    const isAdmin = this.isAdmin;
    const isSuperAdmin = this.isSuperAdmin;
    this.authenticationService.logout();
    this.router.navigate([`/${RouterPath.login}`]);
  }
  private loadAvatarImage(userData) {
    //console.log("userData", userData);
    if (userData.avatar_path) {
      // let image = new UploadImage();
      //       image.id = userData.avatar_path;
      //       this.getImageById(image);
      //this.profileImageUrl =
    }
  }



  setupUserInfo() {
    //get employee list
    //console.log(this.authenticationService.currentUserValue);
    if (!this.authenticationService.currentUserValue.employee_list) {
      this.authenticationService.currentUserValue.employee_list = [];
    }
    //console.log(this.employeeArray);
    if (this.employeeArray) {
      var currUser = this.employeeArray.find(o => o._id == this.authenticationService.currentUserValue.employee_id);
      //console.log(currUser);
      if (currUser) {
        //console.log(currUser);

        let pos = this.positionArray.find(o => o._id == currUser.position_id);
        //console.log('pos.is_manager:'+ pos.is_manager);
        //console.log(this.authenticationService.currentUserValue);
        //this.authenticationService.currentUserValue.is_manager = false;
        //console.log(this.authenticationService.currentUserValue);
        if (pos) {
          //console.log('post: ',pos);
          if (pos.is_manager) {
            this.authenticationService.currentUserValue.is_manager = pos.is_manager ? pos.is_manager : false;
            let emp_list = this.employeeArray.filter(o => o.manager_id == this.authenticationService.currentUserValue.employee_id).map(x => x._id);
            //console.log(emp_list);
            this.authenticationService.currentUserValue.employee_list = emp_list;

            // this.authenticationService.setValue('is_manager', this.authenticationService.currentUserValue.is_manager);
          }
        }

        //console.log(this.authenticationService.currentUserValue.employee_list );

        this.authenticationService.currentUserValue.employee_list.push(currUser._id);
        //console.log(this.authenticationService.currentUserValue);
      }
    }
  }
}
