import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';
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
    const newBooking: Booking = {
      ...booking,
      userId: this.authService.getUserId,
    };

    return this.httpClient
      .post<{ name: string }>(this.getApiUrl(), { ...newBooking, id: null })
      .pipe(
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
    return this.httpClient.delete(this.getApiUrl(`/${bookingId}.json`)).pipe(
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
    return this.httpClient
      .get<{ [key: string]: Booking }>(
        `${this.getApiUrl()}?orderBy="userId"&equalTo="${
          this.authService.getUserId
        }"`,
      )
      .pipe(
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
