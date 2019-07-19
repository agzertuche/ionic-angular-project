import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthResponseData } from './services/authResponseData.model';
import { Observable } from 'rxjs';

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
    private alertCtrl: AlertController,
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingElem => {
        loadingElem.present();
        let authObservable: Observable<AuthResponseData>;

        if (this.isLogin) {
          authObservable = this.authService.login(email, password);
        } else {
          authObservable = this.authService.signup(email, password);
        }

        authObservable.subscribe(
          (data: AuthResponseData) => {
            this.isLoading = false;
            loadingElem.dismiss();
          },
          error => {
            loadingElem.dismiss();
            const code = error.error.error.message;
            let message = 'Could not sign you up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email address already exists!';
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail address could not be found.';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'This password is not correct.';
            }
            this.showAlert(message);
          },
        );
      });
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({ header: 'Authentication failed', message, buttons: ['Okay'] })
      .then(alertElem => alertElem.present());
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
    this.authenticate(email, password);
    form.reset();
  }
}
