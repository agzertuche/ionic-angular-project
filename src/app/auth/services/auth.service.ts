import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthResponseData } from './authResponseData.model';
import { BehaviorSubject, from } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get getUserIsAuthenticated() {
    return this.user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.getToken;
        } else {
          return false;
        }
      }),
    );
  }

  get getUserId() {
    return this.user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      }),
    );
  }

  get getToken() {
    return this.user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.getToken;
        } else {
          return null;
        }
      }),
    );
  }

  constructor(private router: Router, private httpClient: HttpClient) {}

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }

        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
        };
        const expirationDate = new Date(parsedData.tokenExpirationDate);
        if (expirationDate <= new Date()) {
          return null;
        }

        return new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationDate,
        );
      }),
      tap(user => {
        if (user) {
          this.user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      }),
    );
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseData>(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${
          environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true },
      )
      .pipe(
        tap(userData => {
          this.setUserDate(userData);
        }),
        tap(() => this.router.navigateByUrl('/places/tabs/discover')),
      );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }

    this.user.next(null);
    Plugins.Storage.remove({ key: 'authData' });
  }

  signup(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseData>(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${
          environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true },
      )
      .pipe(tap(userData => this.setUserDate(userData)));
  }

  private setUserDate({ localId, email: userEmail, idToken, expiresIn }) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(localId, userEmail, idToken, expirationDate);

    this.user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      localId,
      idToken,
      expirationDate.toISOString(),
      userEmail,
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string,
  ) {
    const authData = { userId, token, tokenExpirationDate, email };
    Plugins.Storage.set({ key: 'authData', value: JSON.stringify(authData) });
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }

    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }
}
