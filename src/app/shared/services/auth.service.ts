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
}
