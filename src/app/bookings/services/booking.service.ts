import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { take, tap, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookings = new BehaviorSubject<Booking[]>([]);
  private getApiUrl = (path?) =>
    `https://ionic-project1-dab73.firebaseio.com/bookings${
      path ? path : '.json'
    }`;

  get getBookings() {
    return this.bookings.asObservable();
  }

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {}

  addBooking(booking: Booking) {
    let generatedId;
    let newBooking: Booking;
    let fetchedUserId: string;
    return this.authService.getUserId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }

        fetchedUserId = userId;
        return this.authService.getToken;
      }),
      take(1),
      switchMap(token => {
        newBooking = {
          ...booking,
          userId: fetchedUserId,
        };

        return this.httpClient.post<{ name: string }>(
          `${this.getApiUrl()}?auth=${token}`,
          {
            ...newBooking,
            id: null,
          },
        );
      }),
      switchMap(response => {
        generatedId = response.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this.bookings.next(bookings.concat(newBooking));
      }),
    );
  }

  cancelBooking(bookingId: string) {
    return this.authService.getToken.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.delete(
          this.getApiUrl(`/${bookingId}.json?auth=${token}`),
        );
      }),
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        this.bookings.next(
          bookings.filter(booking => booking.id !== bookingId),
        );
      }),
    );
  }

  fetchBookings() {
    let fetchedUserId: string;

    return this.authService.getUserId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User not found!');
        }
        fetchedUserId = userId;
        return this.authService.getToken;
      }),
      take(1),
      switchMap(token => {
        return this.httpClient.get<{ [key: string]: Booking }>(
          `${this.getApiUrl()}?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`,
        );
      }),
      map(response => {
        const bookings: Booking[] = [];
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            const element = response[key];
            bookings.push({
              ...element,
              id: key,
              bookedFrom: new Date(element.bookedFrom),
              bookedTo: new Date(element.bookedTo),
            });
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this.bookings.next(bookings);
      }),
    );
  }
}
