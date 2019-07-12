import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private loadingCtrl: LoadingController,
    private authService: AuthService,
  ) {}

  ngOnInit() {}

  onLogin() {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingElem => {
        loadingElem.present();
        setTimeout(() => {
          this.isLoading = false;
          loadingElem.dismiss();
          this.authService.login();
        }, 1500);
      });
  }

  onLogout() {
    this.authService.logout();
  }

  onSwitchMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;

    if (this.isLogin) {
    } else {
    }
  }
}
