import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated$ = new BehaviorSubject(false);

  constructor(private router: Router) {}

  login() {
    this.isAuthenticated$.next(true);
    this.router.navigate(['']);
  }

  logOut() {
    this.isAuthenticated$.next(false);
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
}
