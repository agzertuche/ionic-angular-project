import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';
import { AuthService } from './auth/services/auth.service';
import { Plugins, Capacitor, AppState } from '@capacitor/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.authSub = this.authService.getUserIsAuthenticated.subscribe(
      isAuthenticated => {
        if (!isAuthenticated && this.previousAuthState !== isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }

        this.previousAuthState = isAuthenticated;
      },
    );

    Plugins.App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this),
    );
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
