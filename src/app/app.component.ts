import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { AuthService } from './auth/services/auth.service';
import { Plugins, Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(private platform: Platform, private authService: AuthService) {
    this.initializeApp();
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
}
