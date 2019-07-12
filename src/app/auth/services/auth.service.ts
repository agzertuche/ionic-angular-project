import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userIsAuthenticated = true;

  get getUserIsAuthenticated() {
    return this.userIsAuthenticated;
  }

  constructor(private router: Router) {}

  login() {
    this.userIsAuthenticated = true;
    this.router.navigateByUrl('/places/tabs/discover');
  }

  logout() {
    this.userIsAuthenticated = false;
    this.router.navigateByUrl('/auth');
  }
}
