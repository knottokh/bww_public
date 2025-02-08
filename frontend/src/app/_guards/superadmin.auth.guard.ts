import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../_services';
import { Role, RouterPath } from '../_models';

@Injectable({ providedIn: 'root' })
export class SupderAdminAuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {
            // check if route is restricted by role
            if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
                // role not authorised so redirect to home page
                if(currentUser.role === Role.SuperAdmin){
                  this.router.navigate([`/${ RouterPath.admincontacts }`]);
                }
                else{
                  this.authenticationService.logout();
                  this.router.navigate([`/${ RouterPath.root }`]);
                }
                return false;
            }

            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate([`/${ RouterPath.adminlogin }`]);//, { queryParams: { returnUrl: state.url } }
        return false;
    }
}
