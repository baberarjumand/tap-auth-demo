import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated$ = new BehaviorSubject(false);
  isProfileComplete$ = new BehaviorSubject(false);

  constructor(private router: Router) {}

  // if profile is complete, then go to home page
  // if profile is incomplete, then go to setup-profile page
  login() {
    this.isAuthenticated$.next(true);
    this.router.navigate(['setup-profile']);
  }

  logOut() {
    this.isAuthenticated$.next(false);
    this.isProfileComplete$.next(false);
    this.router.navigate(['login']);
  }

  signUp() {
    this.isAuthenticated$.next(true);
    this.router.navigate(['']);
  }

  isUserHandleUnique(handle: string) {
    // console.log('Checking input: ' + handle);

    return new Promise((resolve) =>
      setTimeout(() => {
        if (handle === 'sample01') {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 1500)
    );

    // if (handle === 'sample01') {
    //   return false;
    // } else {
    //   return true;
    // }
  }

  submitUserHandleForm() {
    this.isProfileComplete$.next(true);
    this.router.navigate(['']);
  }
}
